const StartHandler = require('./handler');
const routes = require('./routes');

module.exports = {
    name: 'start',
    version: '1.0.0',
    require: async (server) => {
        const startHandler = new StartHandler();
        server.route(routes(startHandler));
    },
};
