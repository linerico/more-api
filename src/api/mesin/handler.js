/* eslint-disable eqeqeq */
const ClientError = require('../../exceptions/ClientError');

class MesinHandler {
    constructor(service, aksesService, storageService, validator, storageServiceDokumen) {
        this._service = service;
        this._aksesService = aksesService;
        this._storageService = storageService;
        this._validator = validator;
        this._storageServiceDokumen = storageServiceDokumen;

        this.postMesinHandler = this.postMesinHandler.bind(this);
        this.getMesinHandler = this.getMesinHandler.bind(this);
        this.getMesinByIdHandler = this.getMesinByIdHandler.bind(this);
        this.getMesinByNameHandler = this.getMesinByNameHandler.bind(this);
        this.putMesinHandler = this.putMesinHandler.bind(this);
        this.deleteMesinHandler = this.deleteMesinHandler.bind(this);
        this.getStatusMesinHandler = this.getStatusMesinHandler.bind(this);
        this.getMesinMonitorHandler = this.getMesinMonitorHandler.bind(this);
        this.putSettingAlarmHandler = this.putSettingAlarmHandler.bind(this);
        this.getMesinMonitorNameHandler = this.getMesinMonitorNameHandler.bind(this);
        this.getLaporanMesinHandler = this.getLaporanMesinHandler.bind(this);
        this.postDokumenHandler = this.postDokumenHandler.bind(this);
        this.getDokumenHandler = this.getDokumenHandler.bind(this);
        this.deleteDokumenHandler = this.deleteDokumenHandler.bind(this);
    }

    async postMesinHandler(request, h) {
        try {
            const { nama_mesin, tipe_mesin, merek_mesin, gambar_mesin } = request.payload;
            console.log(request.payload.gambar_mesin);
            this._validator.validateMesinPayload({ nama_mesin, tipe_mesin, merek_mesin });
            this._validator.validateMesinImgHeaders(gambar_mesin.hapi.headers);

            const { id: id_pabrik } = request.params;
            const { id: credentialId } = request.auth.credentials;

            await this._aksesService.verifyAksesPemilikAdminPabrik(credentialId, id_pabrik);
            await this._service.verifyNamaMesin(id_pabrik, nama_mesin);

            const filename = await this._storageService.writeFile(gambar_mesin, gambar_mesin.hapi, '/mesin/img');
            // const fileLocation = `http://${process.env.HOST}:${process.env.PORT}/mesin/images/${filename}`;

            await this._service.addMesin(id_pabrik, { nama_mesin, tipe_mesin, merek_mesin, gambar_mesin: filename });

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

    async getMesinByIdHandler(request, h) {
        try {
            const { id: id_pabrik, idMesin } = request.params;
            const { id: credentialId } = request.auth.credentials;

            await this._aksesService.cekStatus(credentialId, id_pabrik);

            const mesin = await this._service.getMesinById(id_pabrik, idMesin);

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
            // this._validator.validateMesinImgHeaders(gambar_mesin.hapi.headers);

            const { id: id_pabrik, idMesin: id_mesin } = request.params;
            const { id: credentialId } = request.auth.credentials;

            await this._aksesService.verifyAksesPemilikAdminPabrik(credentialId, id_pabrik);
            // await this._service.verifyNamaMesin(id_pabrik, nama_mesin);
            let filename;
            if (gambar_mesin != undefined) {
                filename = await this._storageService.writeFile(gambar_mesin, gambar_mesin.hapi, '/mesin/img');
            }
            // const filename = await this._storageService.writeFile(gambar_mesin, gambar_mesin.hapi, '/mesin/img');
            // const fileLocation = `http://${process.env.HOST}:${process.env.PORT}/mesin/images/${filename}`;

            await this._service.editMesin(id_pabrik, id_mesin, { nama_mesin, tipe_mesin, merek_mesin, gambar_mesin: filename });

            const response = h.response({
                status: 'success',
                message: 'Mesin berhasil diperbarui',
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

    async getStatusMesinHandler(request, h) {
        try {
            const { id: id_pabrik, idMesin: id_mesin } = request.params;
            const { id: credentialId } = request.auth.credentials;

            await this._aksesService.cekStatus(credentialId, id_pabrik);

            const status = await this._service.getStatusOnline(id_mesin);
            console.log(status);
            const response = h.response({
                status: 'success',
                data: {
                    online: status,
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

    async getMesinMonitorHandler(request, h) {
        try {
            const { id: id_pabrik, idMesin: id_mesin } = request.params;
            const { id: credentialId } = request.auth.credentials;

            await this._aksesService.cekStatus(credentialId, id_pabrik);

            const monitor = await this._service.viewMonitorMesin(id_mesin);

            const response = h.response({
                status: 'success',
                data: {
                    monitor,
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

    async putSettingAlarmHandler(request, h) {
        try {
            this._validator.validateSettingPayload(request.payload);

            const { id: id_pabrik, idMesin: id_mesin } = request.params;
            const { id: credentialId } = request.auth.credentials;

            console.log(request.payload);

            await this._aksesService.verifyAksesPemilikAdminPabrik(credentialId, id_pabrik);

            await this._service.SettingAlarm(id_mesin, request.payload);

            const response = h.response({
                status: 'success',
                message: 'Setting alarm berhasil diperbarui',
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

    async getMesinMonitorNameHandler(request, h) {
        try {
            const { id: id_pabrik, idMesin: id_mesin } = request.params;
            const { id: credentialId } = request.auth.credentials;

            await this._aksesService.cekStatus(credentialId, id_pabrik);

            const variabel = await this._service.getMesinMonitorName(id_mesin);

            const response = h.response({
                status: 'success',
                data: {
                    variabel,
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

    async getLaporanMesinHandler(request, h) {
        try {
            // console.log(request.payload);
            const { id: id_pabrik, idMesin: id_mesin } = request.params;
            const { nama, start, stop } = request.payload;
            const { id: credentialId } = request.auth.credentials;

            await this._aksesService.cekStatus(credentialId, id_pabrik);

            const laporan = await this._service.getLaporan(id_mesin, nama, start, stop);

            const response = h.response({
                status: 'success',
                data: {
                    laporan,
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

    async postDokumenHandler(request, h) {
        try {
            const { gantiNama, nama, dokumen } = request.payload;
            // this._validator.validateMesinPayload({ nama_mesin, tipe_mesin, merek_mesin });
            // this._validator.validateMesinImgHeaders(gambar_mesin.hapi.headers);

            const { id: id_pabrik, idMesin: id_mesin } = request.params;
            const { id: credentialId } = request.auth.credentials;

            await this._aksesService.verifyAksesPemilikAdminPabrik(credentialId, id_pabrik);

            const filename = await this._storageServiceDokumen.writeFile(dokumen, dokumen.hapi, '/mesin/doc');
            // const fileLocation = `http://${process.env.HOST}:${process.env.PORT}/mesin/dokumen/${filename}`;
            console.log(gantiNama, nama);
            // console.log(dokumen.hapi.filename);
            if (gantiNama == 1) {
                await this._service.addDokumen(id_mesin, nama, filename);
            } else {
                await this._service.addDokumen(id_mesin, dokumen.hapi.filename, filename);
            }
            const response = h.response({
                status: 'success',
                message: 'Dokumen berhasil ditambahkan',
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

    async getDokumenHandler(request, h) {
        try {
            const { id: id_pabrik, idMesin: id_mesin } = request.params;
            const { id: credentialId } = request.auth.credentials;

            await this._aksesService.cekStatus(credentialId, id_pabrik);

            const dokumen = await this._service.getDokumen(id_mesin);

            const response = h.response({
                status: 'success',
                data: {
                    dokumen,
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

    async deleteDokumenHandler(request, h) {
        try {
            const { id: id_pabrik, idDoc: id_dokumen } = request.params;
            const { id: credentialId } = request.auth.credentials;

            await this._aksesService.cekStatus(credentialId, id_pabrik);

            await this._service.deleteDokumen(id_dokumen);

            const response = h.response({
                status: 'success',
                message: 'Dokumen berhasil dihapus',
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
}

module.exports = MesinHandler;
