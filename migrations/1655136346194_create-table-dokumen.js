/* eslint-disable camelcase */
exports.up = (pgm) => {
    pgm.createTable('dokumen', {
        id_dokumen: {
            type: 'VARCHAR(50)',
            primaryKey: true,
        },
        id_mesin: {
            type: 'VARCHAR(50)',
            notNull: true,
        },
        nama: {
            type: 'TEXT',
            notNull: true,
        },
        dokumen: {
            type: 'TEXT',
            notNull: true,
        },
    });

    pgm.addConstraint('dokumen', 'fk_dokumen-id_mesin_mesin.id_mesin', 'FOREIGN KEY (id_mesin) REFERENCES mesin(id_mesin) ON DELETE CASCADE');
};

exports.down = (pgm) => {
    pgm.dropTable('dokumen');
};
