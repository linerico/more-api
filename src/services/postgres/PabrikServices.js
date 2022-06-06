const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
// const NotFoundError = require('../../exceptions/NotFoundError');

class PabrikService {
    constructor() {
        this._pool = new Pool();
    }

    async addPabrik(userId, { nama_pabrik, alamat_pabrik, kab_kota_pabrik, provinsi_pabrik, gambar_pabrik, peta_pabrik }) {
        const id = `pabrik-${nanoid(16)}`;

        const query = {
            text: 'INSERT INTO pabrik VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
            values: [id, nama_pabrik, alamat_pabrik, kab_kota_pabrik, provinsi_pabrik, gambar_pabrik, peta_pabrik],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new InvariantError('pabrik gagak ditambahkan');
        }

        return result.rows[0].id;
    }

    async getAllPabrik(userId) {
        const query = {
            text: `SELECT pabrik.* FROM pabrik 
            LEFT JOIN akses_pengguna_pabrik ON akses_pengguna_pabrik.id_pabrik = pabrik.id_pabrik 
            WHERE akses_pengguna_pabrik.id_pengguna = $1 
            GROUP BY pabrik.id_pabrik`,
            values: [userId],
        };
        const result = await this._pool.query(query);

        return result.rows;
    }

    async getPabrikByName(userId, filterNama) {
        const query = {
            text: `SELECT pabrik.* FROM pabrik 
            LEFT JOIN akses_pengguna_pabrik ON akses_pengguna_pabrik.id_pabrik = pabrik.id_pabrik 
            WHERE akses_pengguna_pabrik.id_pengguna = $1 AND pabrik.nama_pabrik LIKE $2
            GROUP BY pabrik.id_pabrik`,
            values: [userId, `%${filterNama}%`],
        };
        const result = await this._pool.query(query);

        return result.rows;
    }

    async editPabrik(userId, id_pabrik, { nama_pabrik, alamat_pabrik, kab_kota_pabrik, provinsi_pabrik, gambar_pabrik, peta_pabrik }) {
        const query = {
            text: `UPDATE pabrik SET
            nama_pabrik = $1,
            alamat_pabrik = $2,
            kab_kota_pabrik = $3,
            provinsi_pabrik = $4,
            gambar_pabrik = $5,
            peta_pabrik = $6
            WHERE id_pabrik = $7 RETURNING id_pabrik`,
            values: [nama_pabrik, alamat_pabrik, kab_kota_pabrik, provinsi_pabrik, gambar_pabrik, peta_pabrik, id_pabrik],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new InvariantError('Gagal memperbarui pabrik. Silakan periksa kembali data pabrik');
        }
    }
}

module.exports = PabrikService;
