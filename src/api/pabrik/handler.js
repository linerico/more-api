/* eslint-disable eqeqeq */
const ClientError = require('../../exceptions/ClientError');

class PabrikHandler {
    constructor(service, validator, storageService) {
        this._service = service;
        this._validator = validator;
        this._storageService = storageService;

        this.postPabrikHandler = this.postPabrikHandler.bind(this);
        this.getAllPabrikHandler = this.getAllPabrikHandler.bind(this);
        this.getPabrikByIdHandler = this.getPabrikByIdHandler.bind(this);
        this.getPabrikByNameHandler = this.getPabrikByNameHandler.bind(this);
        this.putPabrikHandler = this.putPabrikHandler.bind(this);
        this.deletePabrikHandler = this.deletePabrikHandler.bind(this);
    }

    async postPabrikHandler(request, h) {
        try {
            const { nama_pabrik, alamat_pabrik, kab_kota_pabrik, provinsi_pabrik, gambar_pabrik, peta_pabrik } = request.payload;
            let filename;
            this._validator.validatePabrikPayload({ nama_pabrik, alamat_pabrik, kab_kota_pabrik, provinsi_pabrik, peta_pabrik });
            console.log(gambar_pabrik);
            if (gambar_pabrik != undefined) {
                console.log('Gambar != undefine');
                this._validator.validatePabrikImgPayload(gambar_pabrik.hapi.headers);
            }
            const { id: credentialId } = request.auth.credentials;
            if (gambar_pabrik != undefined) {
                filename = await this._storageService.writeFile(gambar_pabrik, gambar_pabrik.hapi, '/pabrik/img');
            }
            // const fileLocation = `http://${process.env.HOST}:${process.env.PORT}/pabrik/images/${filename}`;

            const id_pabrik = await this._service.addPabrik(credentialId, { nama_pabrik, alamat_pabrik, kab_kota_pabrik, provinsi_pabrik, gambar_pabrik: filename, peta_pabrik });

            const response = h.response({
                status: 'success',
                message: 'Pabrik berhasil ditambahkan',
                data: {
                    id_pabrik,
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

    async getAllPabrikHandler(request, h) {
        try {
            const { id: credentialId } = request.auth.credentials;
            const pabrik = await this._service.getAllPabrik(credentialId);
            const response = h.response({
                status: 'OK',
                data: {
                    pabrik,
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

    async getPabrikByIdHandler(request, h) {
        try {
            const { id: credentialId } = request.auth.credentials;
            const { id } = request.params;
            const pabrik = await this._service.getPabrikById(credentialId, id);
            const response = h.response({
                status: 'OK',
                data: {
                    pabrik,
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

    async getPabrikByNameHandler(request, h) {
        try {
            const { id: credentialId } = request.auth.credentials;
            const { nama } = request.params;
            const pabrik = await this._service.getPabrikByName(credentialId, nama);
            const response = h.response({
                status: 'OK',
                data: {
                    pabrik,
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

    async putPabrikHandler(request, h) {
        try {
            const { nama_pabrik, alamat_pabrik, kab_kota_pabrik, provinsi_pabrik, gambar_pabrik, peta_pabrik } = request.payload;
            this._validator.validatePabrikPayload({ nama_pabrik, alamat_pabrik, kab_kota_pabrik, provinsi_pabrik, peta_pabrik });
            this._validator.validatePabrikImgPayload(gambar_pabrik.hapi.headers);

            const { id: credentialId } = request.auth.credentials;
            const { id } = request.params;

            const filename = await this._storageService.writeFile(gambar_pabrik, gambar_pabrik.hapi, '/pabrik/img');
            // const fileLocation = `http://${process.env.HOST}:${process.env.PORT}/pabrik/images/${filename}`;

            await this._service.editPabrik(credentialId, id, { nama_pabrik, alamat_pabrik, kab_kota_pabrik, provinsi_pabrik, gambar_pabrik: filename, peta_pabrik });

            const response = h.response({
                status: 'ok',
                message: 'Pabrik berhasil diperbarui',
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

    async deletePabrikHandler(request, h) {
        try {
            const { id: id_pabrik } = request.params;
            const { id: credentialId } = request.auth.credentials;

            await this._service.deletePabrik(credentialId, id_pabrik);

            return {
                status: 'success',
                message: 'Pabrik berhasil di hapus',
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
}

module.exports = PabrikHandler;
