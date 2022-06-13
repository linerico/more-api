const { MesinPayloadSchema, MesinImgHeadersSchema, SettingPayloadSchema } = require('./schema');

const InvariantError = require('../../exceptions/InvariantError');

const MesinValidator = {
    validateMesinPayload: (payload) => {
        const validationResult = MesinPayloadSchema.validate(payload);
        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message);
        }
    },
    validateMesinImgHeaders: (headers) => {
        const validationResult = MesinImgHeadersSchema.validate(headers);

        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message);
        }
    },
    validateSettingPayload: (payload) => {
        const validationResult = SettingPayloadSchema.validate(payload);
        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message);
        }
    },
};

module.exports = MesinValidator;
