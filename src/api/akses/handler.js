const ClientError = require('../../exceptions/ClientError');

class AksesHandler {
    constructor(service, validator) {
        this._service = service;
        this._validator = validator;

        this.postAksesHandler = this.postAksesHandler.bind(this);
        this.getAnggotaHandler = this.getAnggotaHandler.bind(this);
        this.deleteAksesHandler = this.deleteAksesHandler.bind(this);
    }

    async postAksesHandler(request, h) {
        try {
            this._validator.validateAksesPayload(request.payload);

            const { id_pabrik, email, status } = request.payload;
            const { id: credentialId } = request.auth.credentials;
            await this._service.addAkses(id_pabrik, credentialId, email, status);
            const response = h.response({
                status: 'success',
                message: 'Anggota berhasil ditambahkan',
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

    async getAnggotaHandler(request, h) {
        try {
            const { id: id_pabrik } = request.params;
            const { id: credentialId } = request.auth.credentials;
            const anggota = await this._service.getAnggotaPabrik(id_pabrik, credentialId);
            const response = h.response({
                status: 'success',
                data: {
                    anggota,
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

    async deleteAksesHandler(request, h) {
        try {
            console.log(request.payload);
            // this._validator.validateDeleteAksesPayload(request.payload);
            const { id_pabrik, email } = request.payload;
            const { id: credentialId } = request.auth.credentials;
            console.log(id_pabrik, email);
            await this._service.deleteAkses(id_pabrik, credentialId, email);
            const response = h.response({
                status: 'success',
                message: 'Anggota berhasil dihapus',
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

module.exports = AksesHandler;
