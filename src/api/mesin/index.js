const MesinHandler = require('./handler');
const routes = require('./routes');

module.exports = {
    name: 'mesin',
    version: '1.0.0',
    register: async (server, { service, aksesService, storageService, validator, storageServiceDokumen }) => {
        const mesinHandler = new MesinHandler(service, aksesService, storageService, validator, storageServiceDokumen);
        server.route(routes(mesinHandler));
    },
};
