const path = require('path');

const routes = (handler) => [
    {
        method: 'POST',
        path: '/pabrik/{id}/mesin',
        handler: handler.postMesinHandler,
        options: {
            auth: 'moreapp_jwt',
            payload: {
                allow: 'multipart/form-data',
                multipart: true,
                output: 'stream',
                maxBytes: 500000,
            },
        },
    },
    {
        method: 'GET',
        path: '/pabrik/{id}/mesin',
        handler: handler.getMesinHandler,
        options: {
            auth: 'moreapp_jwt',
        },
    },
    {
        method: 'GET',
        path: '/pabrik/{id}/mesin/{filter}',
        handler: handler.getMesinByNameHandler,
        options: {
            auth: 'moreapp_jwt',
        },
    },
    {
        method: 'PUT',
        path: '/pabrik/{id}/mesin/{idMesin}',
        handler: handler.putMesinHandler,
        options: {
            auth: 'moreapp_jwt',
            payload: {
                allow: 'multipart/form-data',
                multipart: true,
                output: 'stream',
                maxBytes: 500000,
            },
        },
    },
    {
        method: 'DELETE',
        path: '/pabrik/{id}/mesin/{idMesin}',
        handler: handler.deleteMesinHandler,
        options: {
            auth: 'moreapp_jwt',
        },
    },
    {
        method: 'GET',
        path: '/mesin/{param*}',
        handler: {
            directory: {
                path: path.resolve(__dirname, 'file'),
            },
        },
    },
];

module.exports = routes;
