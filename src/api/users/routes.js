const path = require('path');

const routes = (handler) => [
    {
        method: 'POST',
        path: '/users/register',
        handler: handler.postUserHandler,
    },
    {
        method: 'POST',
        path: '/users/sendverifikasi',
        handler: handler.postEmailVerifikasiHandler,
    },
    {
        method: 'POST',
        path: '/users/verifikasi',
        handler: handler.postVerifikasiHandler,
    },
    {
        method: 'GET',
        path: '/users',
        handler: handler.getUserByIdHandler,
        options: {
            auth: 'moreapp_jwt',
        },
    },
    {
        method: 'PUT',
        path: '/users',
        handler: handler.putUserByIdHandler,
        options: {
            auth: 'moreapp_jwt',
        },
    },
    {
        method: 'PUT',
        path: '/users/uploadprofilimage',
        handler: handler.putUserProfilImageHandler,
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
        path: '/profil/{param*}',
        handler: {
            directory: {
                path: path.resolve(__dirname, 'file'),
            },
        },
    },
];

module.exports = routes;
