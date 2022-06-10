const ClientError = require('../../exceptions/ClientError');

class MesinHandler {
    constructor(service, aksesService, storageService, validator) {
        this._service = service;
        this._aksesService = aksesService;
        this._storageService = storageService;
        this._validator = validator;

        this.postMesinHandler = this.postMesinHandler.bind(this);
        this.getMesinHandler = this.getMesinHandler.bind(this);
        this.getMesinByNameHandler = this.getMesinByNameHandler.bind(this);
        this.putMesinHandler = this.putMesinHandler.bind(this);
        this.deleteMesinHandler = this.deleteMesinHandler.bind(this);
    }

    async postMesinHandler(request, h) {
        try {
            const { nama_mesin, tipe_mesin, merek_mesin, gambar_mesin } = request.payload;
            this._validator.validateMesinPayload({ nama_mesin, tipe_mesin, merek_mesin });
            this._validator.validateMesinImgHeaders(gambar_mesin.hapi.headers);

            const { id: id_pabrik } = request.params;
            const { id: credentialId } = request.auth.credentials;

            await this._aksesService.verifyAksesPemilikAdminPabrik(credentialId, id_pabrik);
            await this._service.verifyNamaMesin(id_pabrik, nama_mesin);

            const filename = await this._storageService.writeFile(gambar_mesin, gambar_mesin.hapi);
            const fileLocation = `http://${process.env.HOST}:${process.env.PORT}/mesin/images/${filename}`;

            await this._service.addMesin(id_pabrik, { nama_mesin, tipe_mesin, merek_mesin, gambar_mesin: fileLocation });

            const response = h.response({
                status: 'success',
                message: 'Mesin berhasil ditambahkan',
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

    async getMesinHandler(request, h) {
        try {
            const { id: id_pabrik } = request.params;
            const { id: credentialId } = request.auth.credentials;

            await this._aksesService.cekStatus(credentialId, id_pabrik);

            const mesin = await this._service.getMesin(id_pabrik);

            const response = h.response({
                status: 'success',
                data: {
                    mesin,
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

    async getMesinByNameHandler(request, h) {
        try {
            const { id: id_pabrik, filter } = request.params;
            const { id: credentialId } = request.auth.credentials;

            await this._aksesService.cekStatus(credentialId, id_pabrik);

            const mesin = await this._service.getMesinByName(id_pabrik, filter);

            const response = h.response({
                status: 'success',
                data: {
                    mesin,
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

    async putMesinHandler(request, h) {
        try {
            const { nama_mesin, tipe_mesin, merek_mesin, gambar_mesin } = request.payload;
            this._validator.validateMesinPayload({ nama_mesin, tipe_mesin, merek_mesin });
            this._validator.validateMesinImgHeaders(gambar_mesin.hapi.headers);

            const { id: id_pabrik, idMesin: id_mesin } = request.params;
            const { id: credentialId } = request.auth.credentials;

            await this._aksesService.verifyAksesPemilikAdminPabrik(credentialId, id_pabrik);
            // await this._service.verifyNamaMesin(id_pabrik, nama_mesin);

            const filename = await this._storageService.writeFile(gambar_mesin, gambar_mesin.hapi);
            const fileLocation = `http://${process.env.HOST}:${process.env.PORT}/mesin/images/${filename}`;

            await this._service.editMesin(id_pabrik, id_mesin, { nama_mesin, tipe_mesin, merek_mesin, gambar_mesin: fileLocation });

            const response = h.response({
                status: 'success',
                message: 'Mesin berhasil diperbarui',
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

    async deleteMesinHandler(request, h) {
        try {
            const { id: id_pabrik, idMesin: id_mesin } = request.params;
            const { id: credentialId } = request.auth.credentials;

            await this._aksesService.verifyAksesPemilikAdminPabrik(credentialId, id_pabrik);

            await this._service.deleteMesin(id_mesin);

            const response = h.response({
                status: 'success',
                message: 'Mesin berhasil dihapus',
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
}

module.exports = MesinHandler;
