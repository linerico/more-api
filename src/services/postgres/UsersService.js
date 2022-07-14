/* eslint-disable eqeqeq */
/* eslint-disable camelcase */
const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const InvariantError = require('../../exceptions/InvariantError');
const AuthenticationError = require('../../exceptions/AuthenticationError');
const AuthorizationError = require('../../exceptions/AuthorizationError');
const ForbiddenError = require('../../exceptions/ForbiddenError');
const NotFoundError = require('../../exceptions/NotFoundError');

class UsersService {
    constructor() {
        this._pool = new Pool();
    }

    async addUser({ nama_pengguna, email, password, no_telepon }) {
        await this.verifyNewEmail(email);

        const id = `user-${nanoid(16)}`;
        const hashedPassword = await bcrypt.hash(password, 10);

        const query = {
            text: 'INSERT INTO pengguna VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id_pengguna',
            values: [id, nama_pengguna, email, hashedPassword, no_telepon, false, null],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new InvariantError('User Gagal ditambahkan');
        }
        return result.rows[0].id_pengguna;
    }

    async resetPassword(email, no_telepon) {
        const query = {
            text: 'SELECT * FROM pengguna WHERE email = $1 AND no_telepon = $2',
            values: [email, no_telepon],
        };

        const result = await this._pool.query(query);
        if (result.rows.length == 0) {
            throw new InvariantError('Email dan No. Telepon yang anda masukan tidak valid');
        }
        const idPengguna = result.rows[0].id_pengguna;
        const newPassword = `${nanoid(8)}`;
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const queryReset = {
            text: 'UPDATE pengguna SET password = $1 WHERE id_pengguna = $4 RETURNING id_pengguna',
            values: [hashedPassword, idPengguna],
        };
        const resultReset = await this._pool.query(queryReset);
        if (!resultReset.rows.length) {
            throw new InvariantError('Gagal mengreset password');
        }
        return newPassword;
    }

    async verifyNewEmail(email) {
        const query = {
            text: 'SELECT email FROM pengguna WHERE email = $1',
            values: [email],
        };

        const result = await this._pool.query(query);

        if (result.rows.length > 0) {
            throw new InvariantError('User yang anda masukan telah terdaftar');
        }
    }

    async verifyEmailVerifikasi(email) {
        const query = {
            text: 'SELECT status_verifikasi FROM pengguna WHERE email = $1',
            values: [email],
        };
        const result = await this._pool.query(query);
        console.log(result.rows);
        if (!result.rows.length) {
            throw new InvariantError('User yang ada masukan tidak terdaftar');
        }
        return result.rows[0].status_verifikasi;
    }

    async getEmailVerifikasi(email) {
        const stsVerify = await this.verifyEmailVerifikasi(email.email);
        console.log(stsVerify);
        if (stsVerify) {
            throw new ForbiddenError('Email yang ada masukan telah terverifikasi');
        }

        const kode = Math.floor(Math.random() * (10000 - 1000) + 1000).toString();
        const id = `verifikasi-${nanoid(16)}`;

        const queryUser = {
            text: 'SELECT id_pengguna FROM pengguna WHERE email = $1',
            values: [email.email],
        };

        const resultUser = await this._pool.query(queryUser);

        if (!resultUser.rows.length) {
            throw new InvariantError('Email yang ada masukan tidak terdaftar');
        }

        const userId = await resultUser.rows[0].id_pengguna;

        const queryClearVerifikasi = {
            text: 'DELETE FROM email_verifikasi WHERE user_id = $1',
            values: [userId],
        };

        this._pool.query(queryClearVerifikasi);

        const queryVerifikasi = {
            text: 'INSERT INTO email_verifikasi VALUES ($1, $2, $3) RETURNING id',
            values: [id, userId, kode],
        };

        const resultVerfikasi = this._pool.query(queryVerifikasi);

        if (!(await resultVerfikasi).rows.length) {
            throw new InvariantError('Gagal membuat verifikasi');
        }

        return kode;
    }

    async verifikasiPengguna(email, kode) {
        const stsVerify = await this.verifyEmailVerifikasi(email);
        console.log(stsVerify);
        if (stsVerify) {
            throw new ForbiddenError('Email yang ada masukan telah terverifikasi');
        }
        // pengecekan email apakah terdaftar
        const queryUser = {
            text: 'SELECT id_pengguna FROM pengguna WHERE email = $1',
            values: [email],
        };
        const resultUser = await this._pool.query(queryUser);
        if (!resultUser.rows.length) {
            throw new InvariantError('Email yang ada masukan tidak terdaftar');
        }

        const userId = await resultUser.rows[0].id_pengguna;

        const queryVerifikasi = {
            text: 'SELECT * FROM email_verifikasi WHERE user_id = $1',
            values: [userId],
        };
        const resultVerfikasi = await this._pool.query(queryVerifikasi);
        if (!resultVerfikasi.rows.length) {
            throw new InvariantError('Kirim kembali kode verifikasi');
        }
        if (resultVerfikasi.rows[0].kode === kode) {
            const queryUserVerifikasi = {
                text: 'UPDATE pengguna SET status_verifikasi = $1 WHERE id_pengguna = $2 RETURNING id_pengguna',
                values: [true, userId],
            };
            const resultUserVerifikasi = await this._pool.query(queryUserVerifikasi);

            if (!resultUserVerifikasi.rows.length) {
                throw new InvariantError('User Gagal ditambahkan');
            }
        } else {
            throw new InvariantError('Kode yang anda masukan tidak cocok');
        }
    }

    async verifyUserCredential(email, password) {
        const query = {
            text: 'SELECT id_pengguna, password FROM pengguna WHERE email = $1',
            values: [email],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new AuthenticationError('Kredensial yang Anda berikan salah');
        }

        const { id_pengguna, password: hashedPassword } = result.rows[0];

        const match = await bcrypt.compare(password, hashedPassword);

        if (!match) {
            throw new AuthenticationError('Kredennsial yang Anda berikan salah');
        }
        const stsVerify = await this.verifyEmailVerifikasi(email);
        if (!stsVerify) {
            throw new ForbiddenError('Email yang ada masukan belum terverifikasi');
        }
        return id_pengguna;
    }

    async getUserById(userId) {
        const query = {
            text: 'SELECT * FROM pengguna WHERE id_pengguna = $1',
            values: [userId],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('User tidak ditemukan');
        }

        return result.rows[0];
    }

    // eslint-disable-next-line class-methods-use-this
    async verifyUserAccess(id, userid) {
        if (id !== userid) {
            throw new AuthorizationError('anda tidak memiliki akses user tersebut');
        }
    }

    async editUser(userId, { nama_pengguna, password, no_telepon }) {
        const queryOldUser = {
            text: 'SELECT * FROM pengguna WHERE id_pengguna = $1',
            values: [userId],
        };
        const resultOldUser = await this._pool.query(queryOldUser);
        const oldUser = resultOldUser.rows[0];
        const newUser = oldUser;
        // cek perubahan nama pengguna
        if (oldUser.nama_pengguna !== nama_pengguna) {
            newUser.nama_pengguna = nama_pengguna;
        }

        // cek perubahan no_telepon
        if (oldUser.no_telepon !== no_telepon) {
            newUser.no_telepon = no_telepon;
        }

        let query;
        if (password !== '') {
            // cek perubahan password
            const match = await bcrypt.compare(password, oldUser.password);
            if (!match) {
                const hashedPassword = await bcrypt.hash(password, 10);
                newUser.password = hashedPassword;
            }

            query = {
                text: 'UPDATE pengguna SET nama_pengguna = $1, password = $2, no_telepon =$3 WHERE id_pengguna = $4 RETURNING id_pengguna',
                values: [newUser.nama_pengguna, newUser.password, newUser.no_telepon, userId],
            };
        } else {
            query = {
                text: 'UPDATE pengguna SET nama_pengguna = $1, no_telepon =$2 WHERE id_pengguna = $3 RETURNING id_pengguna',
                values: [newUser.nama_pengguna, newUser.no_telepon, userId],
            };
        }
        console.log(query);

        const resultNewUser = await this._pool.query(query);
        if (!resultNewUser.rows.length) {
            throw new InvariantError('User gagal diperbarui');
        }

        return resultNewUser.rows[0].id_pengguna;
    }

    async uploadProfilImg(id, img) {
        const query = {
            text: 'UPDATE pengguna SET foto_profil = $1 WHERE id_pengguna = $2 RETURNING id_pengguna',
            values: [img, id],
        };
        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new InvariantError('Gagal memperbarui foto profil, id tidak ditemukan');
        }
    }

    async getIdByEmail(email) {
        const query = {
            text: 'SELECT id_pengguna FROM pengguna WHERE email = $1',
            values: [email],
        };
        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new InvariantError('email yang anda masukan belum terdaftar dalam sistem');
        }

        return result.rows[0].id_pengguna;
    }
}

module.exports = UsersService;
