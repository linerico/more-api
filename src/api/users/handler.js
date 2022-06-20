const ClientError = require('../../exceptions/ClientError');

class UserHandler {
    constructor(service, validator, mailSender, storageService) {
        this._service = service;
        this._validator = validator;
        this._mailSender = mailSender;
        this._storageService = storageService;

        this.postUserHandler = this.postUserHandler.bind(this);
        this.postEmailVerifikasiHandler = this.postEmailVerifikasiHandler.bind(this);
        this.postVerifikasiHandler = this.postVerifikasiHandler.bind(this);
        this.getUserByIdHandler = this.getUserByIdHandler.bind(this);
        this.putUserByIdHandler = this.putUserByIdHandler.bind(this);
        this.putUserProfilImageHandler = this.putUserProfilImageHandler.bind(this);
    }

    // eslint-disable-next-line class-methods-use-this
    async getStartHandler(request, h) {
        const response = h.response({
            status: 'success',
            message: 'Selamat datang di Rest API Aplikasi MoRe (Monitoring and Resport System)',
        });
        return response;
    }

    async postUserHandler(request, h) {
        try {
            console.log(request.payload);
            this._validator.validateUserPayload(request.payload);
            const { nama_pengguna, email, password, no_telepon } = request.payload;
            const userId = await this._service.addUser({ nama_pengguna, email, password, no_telepon });

            const response = h.response({
                status: 'success',
                data: {
                    id_pengguna: userId,
                },
            });
            response.code(201);
            return response;
        } catch (error) {
            if (error instanceof ClientError) {
                const response = h.response({
                    status: 'fail',
                    message: error.message,
                });
                response.code(error.statusCode);
                return response;
            }

            // Server ERROR!
            const response = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami.',
            });
            response.code(500);
            console.error(error);
            return response;
        }
    }

    async postEmailVerifikasiHandler(request, h) {
        try {
            const email = request.payload;
            const kode = await this._service.getEmailVerifikasi(email);

            await this._mailSender.sendEmailVerifikasi(email.email, kode);

            const response = h.response({
                status: 'success',
                message: 'kode verifikasi berhasil dikirim',
                data: {
                    kode,
                },
            });
            response.code(200);
            return response;
        } catch (error) {
            if (error instanceof ClientError) {
                const response = h.response({
                    status: 'fail',
                    message: error.message,
                });
                response.code(error.statusCode);
                return response;
            }

            // Server ERROR!
            const response = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami.',
            });
            response.code(500);
            console.error(error);
            return response;
        }
    }

    async postVerifikasiHandler(request, h) {
        try {
            this._validator.validatorKodeVerifikasiPayload(request.payload);
            const { email, kode } = request.payload;
            await this._service.verifikasiPengguna(email, kode);
            const response = h.response({
                status: 'success',
                message: 'Email anda telah terverifikasi',
            });
            response.code(200);
            return response;
        } catch (error) {
            if (error instanceof ClientError) {
                const response = h.response({
                    status: 'fail',
                    message: error.message,
                });
                response.code(error.statusCode);
                return response;
            }

            // Server ERROR!
            const response = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami.',
            });
            response.code(500);
            console.error(error);
            return response;
        }
    }

    async getUserByIdHandler(request, h) {
        try {
            const { id: credentialId } = request.auth.credentials;
            const user = await this._service.getUserById(credentialId);
            return {
                status: 'success',
                data: {
                    user,
                },
            };
        } catch (error) {
            if (error instanceof ClientError) {
                const response = h.response({
                    status: 'fail',
                    message: error.message,
                });
                response.code(error.statusCode);
                return response;
            }

            // Server ERROR!
            const response = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami.',
            });
            response.code(500);
            console.error(error);
            return response;
        }
    }

    async putUserByIdHandler(request, h) {
        try {
            this._validator.validatorEditUserPayload(request.payload);
            const { id: credentialId } = request.auth.credentials;
            const { nama_pengguna, password, no_telepon } = request.payload;
            const userId = await this._service.editUser(credentialId, { nama_pengguna, password, no_telepon });
            return {
                status: 'success',
                data: {
                    userId,
                },
            };
        } catch (error) {
            if (error instanceof ClientError) {
                const response = h.response({
                    status: 'fail',
                    message: error.message,
                });
                response.code(error.statusCode);
                return response;
            }

            // Server ERROR!
            const response = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami.',
            });
            response.code(500);
            console.error(error);
            return response;
        }
    }

    async putUserProfilImageHandler(request, h) {
        try {
            const { img } = request.payload;
            this._validator.validatorProfilImagePayload(img.hapi.headers);
            const { id: credentialId } = request.auth.credentials;

            const filename = await this._storageService.writeFile(img, img.hapi, '/user/img');
            // const fileLocation = `http://${process.env.HOST}:${process.env.PORT}/profil/images/${filename}`;

            await this._service.uploadProfilImg(credentialId, filename);

            const response = h.response({
                status: 'success',
                message: 'foto profil berhasil diperbarui',
                data: {
                    fileLocation: filename,
                },
            });
            return response;
        } catch (error) {
            if (error instanceof ClientError) {
                const response = h.response({
                    status: 'fail',
                    message: error.message,
                });
                response.code(error.statusCode);
                return response;
            }

            // Server ERROR!
            const response = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami.',
            });
            response.code(500);
            console.error(error);
            return response;
        }
    }
}

module.exports = UserHandler;
