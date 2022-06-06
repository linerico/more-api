/* eslint-disable camelcase */
exports.up = (pgm) => {
    // pgm.createType('STATUS', ['PEMILIK', 'ADMIN', 'ANGGOTA']);
    pgm.createTable('akses_pengguna_pabrik', {
        id_akses: {
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
        status: {
            type: 'STATUS',
            notNull: true,
        },
    });

    pgm.addConstraint('akses_pengguna_pabrik', 'fk_akses_pengguna_pabrik.id_pengguna-pengguna.id_pengguna', 'FOREIGN KEY(id_pengguna) REFERENCES pengguna(id_pengguna) ON DELETE CASCADE');
    pgm.addConstraint('akses_pengguna_pabrik', 'fk_akses_pengguna_pabrik.id_pabrik-pabrik.id_pabrik', 'FOREIGN KEY(id_pabrik) REFERENCES pabrik(id_pabrik) ON DELETE CASCADE');
};

exports.down = (pgm) => {
    pgm.dropTable('akses_pengguna_pabrik');
};
