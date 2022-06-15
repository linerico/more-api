/* eslint-disable class-methods-use-this */
class StartHandler {
    async getStartHandler(h) {
        const response = h.response({
            status: 'success',
            message: 'Selamat datang di Rest API Aplikasi MoRe (Monitoring and Resport System)',
        });
        return response;
    }
}

module.exports = StartHandler;
