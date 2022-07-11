const Joi = require('joi');

const UserPayloadSchema = Joi.object({
    nama_pengguna: Joi.string().required(),
    email: Joi.string().required(),
    password: Joi.string().required(),
    no_telepon: Joi.string().required(),
});

const KodeVerifikasiPayload = Joi.object({
    email: Joi.string(),
    kode: Joi.string().required(),
});

const EditUserPayloadSchema = Joi.object({
    nama_pengguna: Joi.string().required(),
    password: Joi.string(),
    no_telepon: Joi.string().required(),
});

const ProfilImagaHandlerSchema = Joi.object({
    'content-type': Joi.string().valid('image/apng', 'image/avif', 'image/gif', 'image/jpeg', 'image/png', 'image/webp', 'image/jpg').required(),
}).unknown();

module.exports = { UserPayloadSchema, KodeVerifikasiPayload, EditUserPayloadSchema, ProfilImagaHandlerSchema };
