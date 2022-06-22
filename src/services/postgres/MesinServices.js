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
            text: `create table laporan_${(id.replace(/-/g, '_'))} ( id_laporan VARCHAR(50), timestamp TEXT, laporan JSON[] )`,
        };

        await this._pool.query(queryLaporan);

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

    async getMesinByName(id_pabrik, nama) {
        const query = {
            text: 'SELECT * FROM Mesin WHERE id_pabrik = $1 AND nama_mesin LIKE $2',
            values: [id_pabrik, `%${nama}%`],
        };

        const result = await this._pool.query(query);

        return result.rows;
    }

    async editMesin(id_pabrik, id_mesin, { nama_mesin, tipe_mesin, merek_mesin, gambar_mesin }) {
        const query = {
            text: `UPDATE MESIN SET
            nama_mesin = $1,
            tipe_mesin = $2,
            merek_mesin = $3,
            gambar_mesin = $4
            WHERE id_mesin = $5
            RETURNING id_mesin`,
            values: [nama_mesin, tipe_mesin, merek_mesin, gambar_mesin, id_mesin],
        };
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
        console.log(result.rows[0]);

        if (ke === -1) {
            throw new InvariantError('namaMonitor yang ada masukan tidak valid');
        }

        const varTemp = variabel[ke];
        varTemp.enableAlarm = enable;
        varTemp.min = min;
        varTemp.max = max;

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
        const { variabel } = result.rows[0];
        const n = variabel.length;
        const nama = [];
        for (let i = 0; i < n; i++) {
            nama.push(variabel[i].nama);
        }
        return nama;
    }

    async getLaporan(id_mesin, nama, start, stop) {
        const query = {
            text: 'SELECT timestamp, $1 FROM $2 WHERE timestamp >= $3 AND timestamp <= $4',
            values: [nama, `laporan_${(id_mesin.replace(/-/g, '_'))}`, start, stop],
        };

        const result = await this._pool.query(query);

        if (result.rows.length) {
            throw new InvariantError('data yang anda cari tidak ditemukan');
        }

        return result.rows;
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
