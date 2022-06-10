require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const Inert = require('@hapi/inert');
const path = require('path');

// Users
const users = require('./api/users');
const UsersService = require('./services/postgres/UsersService');
const UsersValidator = require('./validator/users');

// AUthentications
const authentications = require('./api/authentications');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const TokenManager = require('./tokenize/TokenManager');
const AuthenticationsValidator = require('./validator/authentications');

// Pabrik
const pabrik = require('./api/pabrik');
const PabrikService = require('./services/postgres/PabrikServices');
const PabrikValidator = require('./validator/pabrik');

// Akses
const akses = require('./api/akses');
const AksesService = require('./services/postgres/AksesServices');
const AksesValidator = require('./validator/akses');

// Mesin
const mesin = require('./api/mesin');
const MesinService = require('./services/postgres/MesinServices');
const MesinValidator = require('./validator/mesin');

// Mail
const MailSender = require('./services/mail/MailSender');

// Storage
const StorageService = require('./services/storage/StorageService');

const init = async () => {
    const usersService = new UsersService();
    const mailSender = new MailSender();
    const authenticationsService = new AuthenticationsService();
    const aksesService = new AksesService(usersService);
    const mesinService = new MesinService();
    const storageService = new StorageService(path.resolve(__dirname, 'api/users/file/images'));
    const storageServicePabrik = new StorageService(path.resolve(__dirname, 'api/pabrik/file/images'));
    const pabrikService = new PabrikService(aksesService);
    const storageServiceMesin = new StorageService(path.resolve(__dirname, 'api/mesin/file/images'));

    const server = Hapi.server({
        port: process.env.PORT,
        host: process.env.HOST,
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
            },
        },
    ]);

    await server.start();
    console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
