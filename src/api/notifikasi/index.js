const NotifikasiHandler = require('./handler');
const routes = require('./routes');

module.exports = {
    name: 'notifikasi',
    version: '1.0.0',
    register: async (server, { service }) => {
        const notifikasiHandler = new NotifikasiHandler(service);
        server.route(routes(notifikasiHandler));
    },
};
