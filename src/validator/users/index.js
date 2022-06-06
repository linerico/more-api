const InvariantError = require('../../exceptions/InvariantError');
const { UserPayloadSchema, KodeVerifikasiPayload, EditUserPayloadSchema, ProfilImagaHandlerSchema } = require('./schema');

const UserValidator = {
    validateUserPayload: (payload) => {
        const validationResult = UserPayloadSchema.validate(payload);

        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message);
        }
    },
    validatorKodeVerifikasiPayload: (payload) => {
        const validationResult = KodeVerifikasiPayload.validate(payload);

        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message);
        }
    },
    validatorEditUserPayload: (payload) => {
        const validationResult = EditUserPayloadSchema.validate(payload);

        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message);
        }
    },

    validatorProfilImagePayload: (headers) => {
        const validationResult = ProfilImagaHandlerSchema.validate(headers);

        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message);
        }
    },
};

module.exports = UserValidator;
