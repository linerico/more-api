const routes = (handler) => [
    {
        method: 'GET',
        path: '/',
        handler: handler.getStartHandler,
    },
];

module.exports = routes;
