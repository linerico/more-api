/* eslint-disable camelcase */

exports.up = (pgm) => {
    pgm.createTable('autentikasi', {
        token: {
            type: 'TEXT',
            notNull: true,
        },
    });
};

exports.down = (pgm) => {
    pgm.dropTable('autentikasi');
};
