const routes = (handler) => [
    {
        method: 'POST',
        path: '/notifikasi',
        handler: handler.postNotifikasiHandler,
    },
    {
        method: 'GET',
        path: '/notifikasi',
        handler: handler.getNotifikasiHandler,
        options: {
            auth: 'moreapp_jwt',
        },
    },
    {
        method: 'PUT',
        path: '/notifikasi/{id}',
        handler: handler.putStatusBacaHandler,
        options: {
            auth: 'moreapp_jwt',
        },
    },
    {
        method: 'GET',
        path: '/notifikasi/unread',
        handler: handler.getUnreadNotifikasi,
        options: {
            auth: 'moreapp_jwt',
        },
    },
];

module.exports = routes;
