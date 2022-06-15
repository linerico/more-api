/* eslint-disable camelcase */
exports.up = (pgm) => {
    pgm.createTable('notifikasi', {
        id_notifikasi: {
            type: 'VARCHAR(50)',
            primaryKey: true,
        },
        id_pengguna: {
            type: 'VARCHAR(50)',
            notNull: true,
        },
        id_pabrik: {
            type: 'VARCHAR(50)',
            notNull: true,
        },
        id_mesin: {
            type: 'VARCHAR(50)',
            notNull: true,
        },
        text: {
            type: 'TEXT',
        },
        baca: {
            type: 'BOOLEAN',
        },
    });
};

exports.down = (pgm) => {
    pgm.dropTable('notifikasi');
};
