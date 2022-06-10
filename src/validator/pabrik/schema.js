const Joi = require('joi');

const PabrikDataPayloadSchema = Joi.object({
    nama_pabrik: Joi.string().required(),
    alamat_pabrik: Joi.string(),
    kab_kota_pabrik: Joi.string(),
    provinsi_pabrik: Joi.string(),
    peta_pabrik: Joi.string(),
});

const PabrikImgHeadersSchema = Joi.object({
    'content-type': Joi.string().valid('image/apng', 'image/avif', 'image/gif', 'image/jpeg', 'image/png', 'image/webp').required(),
}).unknown();

module.exports = { PabrikDataPayloadSchema, PabrikImgHeadersSchema };
