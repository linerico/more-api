/* eslint-disable camelcase */
exports.up = (pgm) => {
    pgm.createTable('mesin', {
        id_mesin: {
            type: 'VARCHAR(50)',
            primaryKey: true,
        },
        nama_mesin: {
            type: 'TEXT',
            notNull: true,
        },
        tipe_mesin: {
            type: 'TEXT',
        },
        merek_mesin: {
            type: 'TEXT',
        },
        gambar_mesin: {
            type: 'TEXT',
        },
        id_pabrik: {
            type: 'VARCHAR(50)',
            notNull: true,
        },
    });

    pgm.addConstraint('mesin', 'fk_mesin.id_pabrik_pabrik.id_pabrik', 'FOREIGN KEY(id_pabrik) REFERENCES pabrik(id_pabrik) ON DELETE CASCADE');
};

exports.down = (pgm) => {
    pgm.dropTable('mesin');
};
