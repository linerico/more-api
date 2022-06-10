const Joi = require('joi');

const MesinPayloadSchema = Joi.object({
    nama_mesin: Joi.string().required(),
    tipe_mesin: Joi.string(),
    merek_mesin: Joi.string(),
});

const MesinImgHeadersSchema = Joi.object({
    'content-type': Joi.string().valid('image/apng', 'image/avif', 'image/gif', 'image/jpeg', 'image/png', 'image/webp').required(),
}).unknown();

module.exports = { MesinPayloadSchema, MesinImgHeadersSchema };
