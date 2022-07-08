/* eslint-disable space-unary-ops */
/* eslint-disable no-plusplus */
const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');

class NotifikasiService {
    constructor() {
        this._pool = new Pool();
    }

    async postNotifikasi(id_mesin, text) {
        const queryIn = {
            text: 'SELECT akses_pengguna_pabrik.*, mesin.id_mesin FROM akses_pengguna_pabrik LEFT JOIN mesin ON akses_pengguna_pabrik.id_pabrik = mesin.id_pabrik WHERE mesin.id_mesin = $1',
            values: [id_mesin],
        };
        const resultIn = await this._pool.query(queryIn);
        if (!resultIn.rows.length) {
            throw new InvariantError('id_mesin yang anda masukan tidak terdaftar');
        }

        console.log(resultIn.rows);

        let temp = '';
        for (let i = 0; i < resultIn.rows.length; i ++) {
            const id = `notifikasi-${nanoid(16)}`;
            temp += `('${id}', '${resultIn.rows[i].id_pengguna}', '${resultIn.rows[i].id_pabrik}', '${resultIn.rows[i].id_mesin}', '${text}', ${false})`;
            if (i < resultIn.rows.length - 1) {
                temp += ', ';
            }
        }

        const queryOut = {
            text: `INSERT INTO notifikasi VALUES ${temp} RETURNING id_notifikasi`,
        };

        const resultOut = await this._pool.query(queryOut);

        if (!resultOut.rows.length) {
            throw new InvariantError('id_mesin yang anda masukan tidak terdaftar');
        }
    }

    async getNotifikasi(id_pengguna) {
        const query = {
            text: 'SELECT * FROM notifikasi WHERE id_pengguna = $1',
            values: [id_pengguna],
        };

        const result = await this._pool.query(query);

        return result.rows;
    }

    async readNotifikasi(id_pengguna, id_notifikasi) {
        const query = {
            text: 'UPDATE notifikasi SET baca = $1 WHERE id_pengguna = $2 AND id_notifikasi = $3 RETURNING id_notifikasi',
            values: [true, id_pengguna, id_notifikasi],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new InvariantError('Gagal Merubah status baca notifikasi');
        }
    }

    async isUnread(id_pengguna) {
        let sts = false;
        const query = {
            text: 'SELECT * FROM notifikasi WHERE id_pengguna = $1',
            values: [id_pengguna],
        };

        const result = await this._pool.query(query);
        for (let i = 0; i < result.rows.length; i++) {
            if (result.rows[i].baca === false) {
                sts = true;
                break;
            }
        }

        return sts;
    }
}

module.exports = NotifikasiService;
