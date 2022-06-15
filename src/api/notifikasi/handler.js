const ClientError = require('../../exceptions/ClientError');

class NotifikasiHandler {
    constructor(service) {
        this._service = service;

        this.postNotifikasiHandler = this.postNotifikasiHandler.bind(this);
        this.getNotifikasiHandler = this.getNotifikasiHandler.bind(this);
        this.putStatusBacaHandler = this.putStatusBacaHandler.bind(this);
    }

    async postNotifikasiHandler(request, h) {
        try {
            const { id_mesin, text } = request.payload;
            await this._service.postNotifikasi(id_mesin, text);

            const response = h.response({
                status: 'success',
                message: 'Notifikasi berhasil ditambahkan',
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

    async getNotifikasiHandler(request, h) {
        try {
            const { id: credentialId } = request.auth.credentials;
            const notifikasi = await this._service.getNotifikasi(credentialId);

            const response = h.response({
                status: 'success',
                data: {
                    notifikasi,
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

    async putStatusBacaHandler(request, h) {
        try {
            const { id: credentialId } = request.auth.credentials;
            const { id: id_notifikasi } = request.params;
            await this._service.readNotifikasi(credentialId, id_notifikasi);

            const response = h.response({
                status: 'success',
                message: 'berhasil berubah status baca notifikasi',
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

module.exports = NotifikasiHandler;
