const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class AksesService {
    constructor(usersService) {
        this._pool = new Pool();
        this._userService = usersService;
    }

    async addAksesPemilik(id_pengguna, id_pabrik) {
        const id_akses = `akses-${nanoid(16)}`;

        const query = {
            text: 'INSERT INTO akses_pengguna_pabrik VALUES($1, $2, $3, $4) RETURNING id_akses',
            values: [id_akses, id_pengguna, id_pabrik, 'PEMILIK'],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new InvariantError('Gagal menambahkan akses pengguna owner');
        }
    }

    async getAnggotaPabrik(id_pabrik, id_pengguna) {
        await this.cekStatus(id_pengguna, id_pabrik);
        const query = {
            text: `SELECT pengguna.id_pengguna, pengguna.nama_pengguna, pengguna.email, pengguna.foto_profil, akses_pengguna_pabrik.status FROM pengguna
            LEFT JOIN akses_pengguna_pabrik ON pengguna.id_pengguna = akses_pengguna_pabrik.id_pengguna
            WHERE akses_pengguna_pabrik.id_pabrik = $1`,
            values: [id_pabrik],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new InvariantError('Gagal menampilkan anggota pabrik');
        }

        return result.rows;
    }

    async addAkses(id_pabrik, id_pengguna_login, email, status) {
        await this.verifyAksesPemilikAdminPabrik(id_pengguna_login, id_pabrik);

        if (status === 'PEMILIK') {
            await this.verifyAksesPemilikPabrik(id_pengguna_login, id_pabrik);
        }
        const id_akses = `akses-${nanoid(16)}`;
        const id_pengguna_add = await this._userService.getIdByEmail(email);

        const aksesTersedia = await this.verifyAksesPabrik(id_pengguna_add, id_pabrik);

        if (aksesTersedia) {
            throw new InvariantError('Email tersebut telah menjadi anggota pabrik tersebut...');
        }
        const query = {
            text: 'INSERT INTO akses_pengguna_pabrik VALUES($1, $2, $3, $4) RETURNING id_akses',
            values: [id_akses, id_pengguna_add, id_pabrik, status],
        };
        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new InvariantError('Gagal menambahkan akses pengguna admin');
        }
    }

    async deleteAkses(id_pabrik, id_pengguna_login, email) {
        await this.verifyAksesPemilikAdminPabrik(id_pengguna_login, id_pabrik);

        const id_pengguna_delete = await this._userService.getIdByEmail(email);

        const status_login = await this.cekStatus(id_pengguna_login, id_pabrik);
        const status_delete = await this.cekStatus(id_pengguna_delete, id_pabrik);

        if (status_login === 'ADMIN' && status_delete === 'PEMILIK') {
            throw new AuthorizationError('anda tidak dapat menghapus pengguna dengan level yang lebih tinggi');
        }

        const query = {
            text: 'DELETE FROM akses_pengguna_pabrik WHERE id_pengguna = $1 AND id_pabrik = $2 RETURNING id_akses',
            values: [id_pengguna_delete, id_pabrik],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new InvariantError('Gagal menghapus akses pengguna');
        }
    }

    async deleteAllAksesPabrik(id_pengguna, id_pabrik) {
        await this.verifyAksesPabrik(id_pengguna, id_pabrik);
        const query = {
            text: 'DELETE FROM akses_pengguna_pabrik WHERE id_pabrik = $1 RETURNING id_akses',
            values: [id_pabrik],
        };
        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new InvariantError('Gagal menghapus akses pengguna pabrik');
        }
    }

    async verifyAksesPemilikPabrik(id_pengguna, id_pabrik) {
        const query = {
            text: 'SELECT * FROM akses_pengguna_pabrik WHERE id_pengguna = $1 AND id_pabrik = $2',
            values: [id_pengguna, id_pabrik],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new InvariantError('anda tidak memiliki akses fitur tersebut ');
        }

        if (result.rows[0].status !== 'PEMILIK') {
            throw new AuthorizationError('Anda tidak memiliki akses untuk fitur tersebut, hanya pemilik yang memiliki akses tersebut.');
        }
    }

    async verifyAksesAdminPabrik(id_pengguna, id_pabrik) {
        const query = {
            text: 'SELECT * FROM akses_pengguna_pabrik WHERE id_pengguna = $1 AND id_pabrik = $2',
            values: [id_pengguna, id_pabrik],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new InvariantError('anda tidak memiliki akses fitur tersebut');
        }

        if (result.rows[0].status !== 'ADMIN') {
            throw new AuthorizationError('Anda tidak memiliki akses untuk fitur tersebut');
        }
    }

    async verifyAksesPemilikAdminPabrik(id_pengguna, id_pabrik) {
        const query = {
            text: 'SELECT * FROM akses_pengguna_pabrik WHERE id_pengguna = $1 AND id_pabrik = $2',
            values: [id_pengguna, id_pabrik],
        };

        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new InvariantError('anda tidak memiliki akses fitur tersebut');
        }

        if (result.rows[0].status === 'ANGGOTA') {
            throw new AuthorizationError('Anda tidak memiliki akses untuk fitur tersebut');
        }
    }

    async verifyAksesPabrik(id_pengguna, id_pabrik) {
        const query = {
            text: 'SELECT * FROM akses_pengguna_pabrik WHERE id_pengguna = $1 AND id_pabrik = $2',
            values: [id_pengguna, id_pabrik],
        };
        let sts = true;
        const result = await this._pool.query(query);

        if (result.rows.length === 0) {
            sts = false;
        }
        return sts;
    }

    async cekStatus(id_pengguna, id_pabrik) {
        const query = {
            text: 'SELECT * FROM akses_pengguna_pabrik WHERE id_pengguna = $1 AND id_pabrik = $2',
            values: [id_pengguna, id_pabrik],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new AuthorizationError('anda tidak memiliki akses fitur tersebut');
        }

        return result.rows[0].status;
    }
}

module.exports = AksesService;
