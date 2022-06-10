const Joi = require('joi');

const AksesPayloadSchema = Joi.object({
    id_pabrik: Joi.string().required(),
    email: Joi.string().required(),
    status: Joi.string().required(),
});

const DeleteAksesPayloadSchema = Joi.object({
    id_pabrik: Joi.string().required(),
    email: Joi.string().required(),
});

module.exports = { AksesPayloadSchema, DeleteAksesPayloadSchema };
