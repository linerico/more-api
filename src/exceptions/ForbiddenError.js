const ClientError = require('./ClientError');

class ForbiddenError extends ClientError {
    constructor(message) {
        super(message, 403);
        this.name = 'Access to that resource is forbidden';
    }
}

module.exports = ForbiddenError;
