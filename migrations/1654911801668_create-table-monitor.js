/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
    pgm.createTable('monitor', {
        id_monitor: {
            type: 'VARCHAR(50)',
            primaryKey: true,
        },
        id_mesin: {
            type: 'VARCHAR(50)',
            notNull: true,
        },
        variabel: {
            type: 'JSON[]',
        },
    });

    pgm.addConstraint('monitor', 'fk_monitor-id_mesin_mesin.id_mesin', 'FOREIGN KEY (id_mesin) REFERENCES mesin(id_mesin) ON DELETE CASCADE');
};

exports.down = (pgm) => {
    pgm.dropTable('monitor');
};
