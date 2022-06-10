const InvariantError = require('../../exceptions/InvariantError');
const { PabrikDataPayloadSchema, PabrikImgHeadersSchema } = require('./schema');

const PabrikValidator = {
    validatePabrikPayload: (payload) => {
        const validationResult = PabrikDataPayloadSchema.validate(payload);
        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message);
        }
    },
    validatePabrikImgPayload: (headers) => {
        const validationResult = PabrikImgHeadersSchema.validate(headers);

        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message);
        }
    },
};

module.exports = PabrikValidator;
