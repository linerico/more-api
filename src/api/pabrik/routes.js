const path = require('path');

const routes = (handler) => [
    {
        method: 'POST',
        path: '/pabrik',
        handler: handler.postPabrikHandler,
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
        path: '/pabrik',
        handler: handler.getAllPabrikHandler,
        options: {
            auth: 'moreapp_jwt',
        },
    },
    {
        method: 'GET',
        path: '/pabrik/id/{id}',
        handler: handler.getPabrikByIdHandler,
        options: {
            auth: 'moreapp_jwt',
        },
    },
    {
        method: 'GET',
        path: '/pabrik/{nama}',
        handler: handler.getPabrikByNameHandler,
        options: {
            auth: 'moreapp_jwt',
        },
    },
    {
        method: 'PUT',
        path: '/pabrik/{id}',
        handler: handler.putPabrikHandler,
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
        path: '/pabrik/{id}',
        handler: handler.deletePabrikHandler,
        options: {
            auth: 'moreapp_jwt',
        },
    },
    {
        method: 'GET',
        path: '/pabrik/{param*}',
        handler: {
            directory: {
                path: path.resolve(__dirname, 'file'),
            },
        },
    },
];

module.exports = routes;
