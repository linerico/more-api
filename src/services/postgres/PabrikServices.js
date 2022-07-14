const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
// const NotFoundError = require('../../exceptions/NotFoundError');

class PabrikService {
    constructor(aksesService) {
        this._pool = new Pool();
        this._aksesService = aksesService;
    }

    async addPabrik(userId, { nama_pabrik, alamat_pabrik, kab_kota_pabrik, provinsi_pabrik, gambar_pabrik, peta_pabrik }) {
        const id = `pabrik-${nanoid(16)}`;

        const query = {
            text: 'INSERT INTO pabrik VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id_pabrik',
            values: [id, nama_pabrik, alamat_pabrik, kab_kota_pabrik, provinsi_pabrik, gambar_pabrik, peta_pabrik],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new InvariantError('pabrik gagak ditambahkan');
        }

        try {
            await this._aksesService.addAksesPemilik(userId, id);
        } catch (error) {
            const queryDelete = {
                text: 'DELETE FROM pabrik WHERE id_pabrik = $1',
                values: [id],
            };
            const resultDelete = await this._pool.query(queryDelete);
            if (!result.rows.length) {
                throw new InvariantError(resultDelete.error);
            }
            throw new InvariantError(error);
        }

        return result.rows[0].id_pabrik;
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

    async getPabrikById(userId, pabrikId) {
        const query = {
            text: `SELECT pabrik.* FROM pabrik 
            LEFT JOIN akses_pengguna_pabrik ON akses_pengguna_pabrik.id_pabrik = pabrik.id_pabrik 
            WHERE akses_pengguna_pabrik.id_pengguna = $1 AND pabrik.id_pabrik = $2
            GROUP BY pabrik.id_pabrik`,
            values: [userId, pabrikId],
        };
        const result = await this._pool.query(query);

        return result.rows[0];
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

    // perlu otorisasi pemilik

    async editPabrik(userId, id_pabrik, { nama_pabrik, alamat_pabrik, kab_kota_pabrik, provinsi_pabrik, gambar_pabrik, peta_pabrik }) {
        await this._aksesService.verifyAksesPemilikPabrik(userId, id_pabrik);
        console.log(gambar_pabrik);
        let query;
        if (gambar_pabrik === undefined) {
            query = {
                text: `UPDATE pabrik SET
                nama_pabrik = $1,
                alamat_pabrik = $2,
                kab_kota_pabrik = $3,
                provinsi_pabrik = $4,
                peta_pabrik = $5
                WHERE id_pabrik = $6 RETURNING id_pabrik`,
                values: [nama_pabrik, alamat_pabrik, kab_kota_pabrik, provinsi_pabrik, peta_pabrik, id_pabrik],
            };
        } else {
            query = {
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
        }

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new InvariantError('Gagal memperbarui pabrik. Silakan periksa kembali data pabrik');
        }
    }

    // perlu otorisasi pemilik
    async deletePabrik(userId, id_pabrik) {
        await this._aksesService.verifyAksesPemilikPabrik(userId, id_pabrik);

        await this._aksesService.deleteAllAksesPabrik(userId, id_pabrik);

        const query = {
            text: 'DELETE FROM pabrik WHERE id_pabrik = $1 RETURNING id_pabrik',
            values: [id_pabrik],
        };

        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new InvariantError('Gagal menghapus Pabrik, id tidak ditemukan');
        }
    }
}

module.exports = PabrikService;
