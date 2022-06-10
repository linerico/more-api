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
