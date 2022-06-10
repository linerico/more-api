const PabrikHandler = require('./handler');
const routes = require('./routes');

module.exports = {
    name: 'pabrik',
    version: '1.0.0',
    register: async (server, { service, validator, storageService }) => {
        const pabrikHandler = new PabrikHandler(service, validator, storageService);
        server.route(routes(pabrikHandler));
    },
};
