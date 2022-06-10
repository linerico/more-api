const routes = (handler) => [
    {
        method: 'POST',
        path: '/akses',
        handler: handler.postAksesHandler,
        options: {
            auth: 'moreapp_jwt',
        },
    },
    {
        method: 'GET',
        path: '/akses/{id}',
        handler: handler.getAnggotaHandler,
        options: {
            auth: 'moreapp_jwt',
        },
    },
    {
        method: 'DELETE',
        path: '/akses',
        handler: handler.deleteAksesHandler,
        options: {
            auth: 'moreapp_jwt',
        },
    },
];
module.exports = routes;
