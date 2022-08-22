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
        path: '/pabrik/{id}/mesin/id/{idMesin}',
        handler: handler.getMesinByIdHandler,
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
        path: '/pabrik/{id}/mesin/{idMesin}/status',
        handler: handler.getStatusMesinHandler,
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
    {
        method: 'GET',
        path: '/pabrik/{id}/mesin/{idMesin}/monitor',
        handler: handler.getMesinMonitorHandler,
        options: {
            auth: 'moreapp_jwt',
        },
    },
    {
        method: 'PUT',
        path: '/pabrik/{id}/mesin/{idMesin}/monitor',
        handler: handler.putSettingAlarmHandler,
        options: {
            auth: 'moreapp_jwt',
        },
    },
    {
        method: 'GET',
        path: '/pabrik/{id}/mesin/{idMesin}/laporan',
        handler: handler.getMesinMonitorNameHandler,
        options: {
            auth: 'moreapp_jwt',
        },
    },
    {
        method: 'POST',
        path: '/pabrik/{id}/mesin/{idMesin}/laporan',
        handler: handler.getLaporanMesinHandler,
        options: {
            auth: 'moreapp_jwt',
        },
    },
    {
        method: 'POST',
        path: '/pabrik/{id}/mesin/{idMesin}/laporanbyname',
        handler: handler.getLaporanByNameHandler,
        options: {
            auth: 'moreapp_jwt',
        },
    },
    {
        method: 'POST',
        path: '/pabrik/{id}/mesin/{idMesin}/laporanchart',
        handler: handler.getLaporanChartHandler,
        options: {
            auth: 'moreapp_jwt',
        },
    },
    {
        method: 'POST',
        path: '/pabrik/{id}/mesin/{idMesin}/laporanchartandroid',
        handler: handler.getLaporanChartAndroidHandler,
        options: {
            auth: 'moreapp_jwt',
        },
    },
    {
        method: 'POST',
        path: '/pabrik/{id}/mesin/{idMesin}/dokumen',
        handler: handler.postDokumenHandler,
        options: {
            auth: 'moreapp_jwt',
            payload: {
                allow: 'multipart/form-data',
                multipart: true,
                output: 'stream',
                maxBytes: 50000000,
            },
        },
    },
    {
        method: 'GET',
        path: '/pabrik/{id}/mesin/{idMesin}/dokumen',
        handler: handler.getDokumenHandler,
        options: {
            auth: 'moreapp_jwt',
        },
    },
    {
        method: 'DELETE',
        path: '/pabrik/{id}/mesin/{idMesin}/dokumen/{idDoc}',
        handler: handler.deleteDokumenHandler,
        options: {
            auth: 'moreapp_jwt',
        },
    },
];

module.exports = routes;
