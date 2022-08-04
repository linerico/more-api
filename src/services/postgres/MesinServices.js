/* eslint-disable radix */
/* eslint-disable eqeqeq */
/* eslint-disable prefer-const */
/* eslint-disable no-const-assign */
/* eslint-disable quotes */
/* eslint-disable space-unary-ops */
/* eslint-disable quote-props */
/* eslint-disable no-plusplus */
const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');

class MesinService {
    constructor() {
        this._pool = new Pool();
    }

    async addMesin(id_pabrik, { nama_mesin, tipe_mesin, merek_mesin, gambar_mesin }) {
        const id = `mesin-${nanoid(16)}`;
        const query = {
            text: 'INSERT INTO mesin VALUES($1, $2, $3, $4, $5, $6) RETURNING id_mesin',
            values: [id, nama_mesin, tipe_mesin, merek_mesin, gambar_mesin, id_pabrik],
        };
        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new InvariantError('Mesin gagal ditambahkan');
        }
        const queryLaporan = {
            text: `create table laporan_${(result.rows[0].id_mesin.replace(/-/g, '_'))} ( id_laporan VARCHAR(50), id_mesin VARCHAR(50), timestamp TEXT, laporan JSON[] )`,
        };
        await this._pool.query(queryLaporan);

        const idMonitor = `monitor-${nanoid(16)}`;
        const queryMonitor = {
            text: 'INSERT INTO monitor VALUES ($1, $2, $3)',
            values: [idMonitor, result.rows[0].id_mesin, []],
        };
        await this._pool.query(queryMonitor);

        return result.rows[0].id_mesin;
    }

    async getMesin(id_pabrik) {
        const query = {
            text: 'SELECT * FROM Mesin WHERE id_pabrik = $1',
            values: [id_pabrik],
        };

        const result = await this._pool.query(query);

        return result.rows;
    }

    async getMesinById(id_pabrik, id_mesin) {
        const query = {
            text: 'SELECT * FROM Mesin WHERE id_pabrik = $1 AND id_mesin = $2',
            values: [id_pabrik, id_mesin],
        };

        const result = await this._pool.query(query);

        return result.rows[0];
    }

    async getMesinByName(id_pabrik, nama) {
        const query = {
            text: 'SELECT * FROM Mesin WHERE id_pabrik = $1 AND nama_mesin LIKE $2',
            values: [id_pabrik, `%${nama}%`],
        };

        const result = await this._pool.query(query);

        return result.rows;
    }

    async editMesin(id_pabrik, id_mesin, { nama_mesin, tipe_mesin, merek_mesin, gambar_mesin }) {
        let query;
        if (gambar_mesin === undefined) {
            query = {
                text: `UPDATE MESIN SET
                nama_mesin = $1,
                tipe_mesin = $2,
                merek_mesin = $3
                WHERE id_mesin = $4
                RETURNING id_mesin`,
                values: [nama_mesin, tipe_mesin, merek_mesin, id_mesin],
            };
        } else {
            query = {
                text: `UPDATE MESIN SET
                nama_mesin = $1,
                tipe_mesin = $2,
                merek_mesin = $3,
                gambar_mesin = $4
                WHERE id_mesin = $5
                RETURNING id_mesin`,
                values: [nama_mesin, tipe_mesin, merek_mesin, gambar_mesin, id_mesin],
            };
        }
        console.log(query);
        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new InvariantError('Gagal mengupdate mesin');
        }
    }

    async deleteMesin(id_mesin) {
        const query = {
            text: 'DELETE FROM mesin WHERE id_mesin = $1 RETURNING id_mesin',
            values: [id_mesin],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new InvariantError('Gagal mengapus mesin tersebut');
        }
    }

    async viewMonitorMesin(id_mesin) {
        const query = {
            text: 'SELECT variabel FROM monitor WHERE id_mesin = $1',
            values: [id_mesin],
        };

        const result = await this._pool.query(query);
        const { variabel } = result.rows[0];

        return variabel;
    }

    async SettingAlarm(id_mesin, { nama, enable, min, max }) {
        if (enable) {
            if (min > max || max < min) {
                throw new InvariantError('Min dan Max yang anda masukan tidak valid');
            }
        }
        const query = {
            text: 'SELECT *  FROM monitor WHERE id_mesin = $1',
            values: [id_mesin],
        };

        const result = await this._pool.query(query);

        let ke = -1;
        const { variabel } = result.rows[0];
        for (let i = 0; i < variabel.length; i++) {
            if (variabel[i].nama === nama) {
                ke = i;
            }
        }
        // console.log(result.rows[0]);

        if (ke === -1) {
            throw new InvariantError('namaMonitor yang ada masukan tidak valid');
        }

        const varTemp = variabel[ke];
        varTemp.enableAlarm = enable;
        varTemp.min = min;
        varTemp.max = max;
        // tidak alarm
        if ((varTemp.min < varTemp.value || varTemp.max > varTemp.value)) {
            varTemp.alarm = false;
        }
        if ((varTemp.min > varTemp.value) || varTemp.max < varTemp.value) {
            varTemp.alarm = true;
        }

        variabel[ke] = varTemp;

        const querySetting = {
            text: 'UPDATE monitor SET variabel = $1 WHERE id_monitor = $2 RETURNING id_monitor',
            values: [variabel, result.rows[0].id_monitor],
        };

        const resultSetting = await this._pool.query(querySetting);

        if (!resultSetting.rows.length) {
            throw new InvariantError('Gagal memperbarui setting alarm monitor');
        }
    }

    async getMesinMonitorName(id_mesin) {
        const query = {
            text: 'SELECT variabel FROM monitor WHERE id_mesin = $1',
            values: [id_mesin],
        };

        const result = await this._pool.query(query);
        try {
            const { variabel } = result.rows[0];
            const n = variabel.length;
            const nama = [];
            for (let i = 0; i < n; i++) {
                nama.push(variabel[i].nama);
            }
            return nama;
        } catch (error) {
            return [];
        }
    }

    async getLaporan(id_mesin, nama, start, stop) {
        // await this.getStatusOnline(id_mesin);
        const query = {
            text: `SELECT * FROM laporan_${(id_mesin.replace(/-/g, '_').toLowerCase())} WHERE timestamp >= $1 AND timestamp <= $2 ORDER BY timestamp DESC`,
            values: [start, stop],
        };
        // console.log(query);

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new InvariantError('data yang anda cari tidak ditemukan');
        }
        // await this.getLaporanbyVar(id_mesin, nama, start, stop);
        // console.log(result.rows);
        return result.rows;
    }

    async getLaporanbyVar(id_mesin, nama, start, stop) {
        let startDate = `${start}`;
        startDate = startDate.split("-");
        let newStartDate = new Date(startDate[2], startDate[1] - 1, startDate[0]);

        let stopDate = `${stop}`;
        stopDate = stopDate.split("-");
        let newStopDate = new Date(stopDate[2], stopDate[1], stopDate[0]);
        console.log(newStartDate.getTime(), newStopDate.getTime());

        // await this.getStatusOnline(id_mesin);
        const query = {
            text: `SELECT * FROM laporan_${(id_mesin.replace(/-/g, '_').toLowerCase())} WHERE timestamp >= $1 AND timestamp <= $2 ORDER BY timestamp DESC`,
            values: [newStartDate.getTime(), newStopDate.getTime()],
        };
        // console.log(query);

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new InvariantError('data yang anda cari tidak ditemukan');
        }
        let laporan = [];
        let myNo = 1;
        for (let i = 0; i < result.rows.length; i++) {
            let temp = result.rows[i];
            // console.log(temp.laporan);
            for (let j = 0; j < temp.laporan.length; j++) {
                let tempj = temp.laporan[j];
                if (tempj.nama == nama && tempj.value != undefined) {
                    // console.log(tempj);
                    // laporan.push(tempj);
                    let waktu = new Date(parseInt(temp.timestamp));
                    const myFormat = `${waktu.getDate()}-${waktu.getMonth() + 1}-${waktu.getFullYear()}  ${waktu.getHours()}:${waktu.getMinutes()}:${waktu.getSeconds()}`;
                    const myla = {
                        nomor: `${myNo}`,
                        nama: tempj.nama,
                        value: `${tempj.value} ${tempj.satuan}`,
                        timestamp: myFormat,
                    };
                    myNo++;
                    laporan.push(myla);
                }
            }
        }
        // console.log(result.rows);
        // console.log(laporan);
        // console.log(result.rows);
        // return result.rows;
        return laporan;
    }

    async addDokumen(id_mesin, nama, dokumen) {
        const id = `dokumen-${nanoid(16)}`;

        const query = {
            text: 'INSERT INTO dokumen VALUES($1, $2, $3, $4) RETURNING id_dokumen',
            values: [id, id_mesin, nama, dokumen],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new InvariantError('Gagal menambahkan dokuman');
        }
    }

    async getDokumen(id_mesin) {
        const query = {
            text: 'SELECT * FROM dokumen WHERE id_mesin = $1',
            values: [id_mesin],
        };

        const result = await this._pool.query(query);

        return result.rows;
    }

    async getStatusOnline(id_mesin) {
        const query = {
            text: 'SELECT update_terakhir FROM monitor WHERE id_mesin = $1',
            values: [id_mesin],
        };
        const result = await this._pool.query(query);
        const timestamp = new Date().getTime();
        let online = false;
        if (result.rows[0].update_terakhir > timestamp - 3000) {
            online = true;
        }
        console.log("status Online : ", online);
        console.log(result.rows[0].update_terakhir, timestamp);
        const res = {
            online,
            last: result.rows[0].update_terakhir,
            now: timestamp,
        };
        return res;
    }

    async deleteDokumen(id_dokumen) {
        const query = {
            text: 'DELETE FROM dokumen WHERE id_dokumen = $1 RETURNING id_dokumen',
            values: [id_dokumen],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new InvariantError('Gagal menghapus dokumen tersebut');
        }
    }

    async verifyNamaMesin(id_pabrik, nama_mesin) {
        const query = {
            text: 'SELECT * FROM mesin WHERE id_pabrik = $1 AND nama_mesin = $2',
            values: [id_pabrik, nama_mesin],
        };

        const result = await this._pool.query(query);

        if (result.rows.length > 0) {
            throw new InvariantError('Nama Mesin yang anda masukan telah terdaftar, Silakan Coba nama lain');
        }
    }
}

module.exports = MesinService;
