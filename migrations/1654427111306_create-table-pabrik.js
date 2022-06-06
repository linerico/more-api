/* eslint-disable camelcase */
exports.up = (pgm) => {
    pgm.createTable('pabrik', {
        id_pabrik: {
            type: 'VARCHAR(50)',
            primaryKey: true,
        },
        nama_pabrik: {
            type: 'TEXT',
            notNull: true,
        },
        alamat_pabrik: {
            type: 'TEXT',
        },
        kab_kota_pabrik: {
            type: 'TEXT',
        },
        provinsi_pabrik: {
            type: 'TEXT',
        },
        gambar_pabrik: {
            type: 'TEXT',
        },
        peta_pabrik: {
            type: 'TEXT',
        },
    });
};

exports.down = (pgm) => {
    pgm.dropTable('pabrik');
};
