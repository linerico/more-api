const InvariantError = require('../../exceptions/InvariantError');
const { AksesPayloadSchema, DeleteAksesPayloadSchema } = require('./schema');

const AksesValidator = {
    validateAksesPayload: (payload) => {
        const validationResult = AksesPayloadSchema.validate(payload);
        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message);
        }
    },
    validateDeleteAksesPayload: (payload) => {
        const validationResult = DeleteAksesPayloadSchema.validate(payload);
        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message);
        }
    },
};

module.exports = AksesValidator;
