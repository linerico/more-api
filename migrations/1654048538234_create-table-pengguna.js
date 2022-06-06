/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
    pgm.createTable('pengguna', {
        id_pengguna: {
            type: 'VARCHAR(50)',
            primaryKey: true,
        },
        nama_pengguna: {
            type: 'TEXT',
            notNull: true,
        },
        email: {
            type: 'TEXT',
            notNull: true,
        },
        password: {
            type: 'TEXT',
            notNull: true,
        },
        no_telepon: {
            type: 'TEXT',
        },
        status_verifikasi: {
            type: 'BOOLEAN',
        },
        foto_profil: {
            type: 'TEXT',
        },
    });
};

exports.down = (pgm) => {
    pgm.dropTable('pengguna');
};
