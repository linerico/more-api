require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const Inert = require('@hapi/inert');
const path = require('path');

// Users
const users = require('./src/api/users');
const UsersService = require('./src/services/postgres/UsersService');
const UsersValidator = require('./src/validator/users');

// AUthentications
const authentications = require('./src/api/authentications');
const AuthenticationsService = require('./src/services/postgres/AuthenticationsService');
const TokenManager = require('./src/tokenize/TokenManager');
const AuthenticationsValidator = require('./src/validator/authentications');

// Pabrik
const pabrik = require('./src/api/pabrik');
const PabrikService = require('./src/services/postgres/PabrikServices');
const PabrikValidator = require('./src/validator/pabrik');

// Akses
const akses = require('./src/api/akses');
const AksesService = require('./src/services/postgres/AksesServices');
const AksesValidator = require('./src/validator/akses');

// Mesin
const mesin = require('./src/api/mesin');
const MesinService = require('./src/services/postgres/MesinServices');
const MesinValidator = require('./src/validator/mesin');

// Notifikasi
const notifikasi = require('./src/api/notifikasi');
const NotifikasiService = require('./src/services/postgres/NotifikasiServices');

// Mail
const MailSender = require('./src/services/mail/MailSender');

// Storage
const StorageService = require('./src/services/storage/StorageService');

const init = async () => {
    const usersService = new UsersService();
    const mailSender = new MailSender();
    const authenticationsService = new AuthenticationsService();
    const aksesService = new AksesService(usersService);
    const mesinService = new MesinService();
    const notifikasiService = new NotifikasiService();
    const storageService = new StorageService(path.resolve(__dirname, 'api/users/file/images'));
    const storageServicePabrik = new StorageService(path.resolve(__dirname, 'api/pabrik/file/images'));
    const pabrikService = new PabrikService(aksesService);
    const storageServiceMesin = new StorageService(path.resolve(__dirname, 'api/mesin/file/images'));
    const storageServiceMesinDokumen = new StorageService(path.resolve(__dirname, 'api/mesin/file/dokumen'));

    const server = Hapi.server({
        port: process.env.PORT,
        host: process.env.NODE_ENV !== 'production' ? 'localhost' : '0.0.0.0',
        routes: {
            cors: {
                origin: ['*'],
            },
        },
    });

    // registrasi plugin eksternal
    await server.register([
        {
            plugin: Jwt,
        },
        {
            plugin: Inert,
        },
    ]);

    // mendefinisikan strategy autentikasi jwt
    server.auth.strategy('moreapp_jwt', 'jwt', {
        keys: process.env.ACCESS_TOKEN_KEY,
        verify: {
            aud: false,
            iss: false,
            sub: false,
            exp: false,
            // maxAgeSec: process.env.ACCESS_TOKEN_AGE,
        },
        validate: (artifacts) => ({
            isValid: true,
            credentials: {
                id: artifacts.decoded.payload.id,
            },
        }),
    });

    await server.register([
        {
            plugin: users,
            options: {
                service: usersService,
                validator: UsersValidator,
                mailSender,
                storageService,
            },
        },
        {
            plugin: authentications,
            options: {
                authenticationsService,
                usersService,
                tokenManager: TokenManager,
                validator: AuthenticationsValidator,
            },
        },
        {
            plugin: pabrik,
            options: {
                service: pabrikService,
                validator: PabrikValidator,
                storageService: storageServicePabrik,
            },
        },
        {
            plugin: akses,
            options: {
                service: aksesService,
                validator: AksesValidator,
            },
        },
        {
            plugin: mesin,
            options: {
                service: mesinService,
                aksesService,
                storageService: storageServiceMesin,
                validator: MesinValidator,
                storageServiceDokumen: storageServiceMesinDokumen,
            },
        },
        {
            plugin: notifikasi,
            options: {
                service: notifikasiService,
            },
        },
    ]);

    await server.start();
    console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
