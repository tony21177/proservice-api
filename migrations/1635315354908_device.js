/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.createTable('devices', {
        id: 'id',
        location: { type: 'varchar(100)', notNull: false },
        ip: { type: 'varchar(50)', notNull: false },
        mac: { type: 'varchar(50)', notNull: false,unique:true },
        hostname: { type: 'varchar(50)', notNull: false },
        createdAt: {
          type: 'timestamp',
          notNull: true,
          default: pgm.func('current_timestamp'),
        },
        updatedAt: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('current_timestamp'),
        }
      })

      pgm.sql("INSERT INTO devices (id,mac) VALUES (1,'48-f1-7f-29-d6-22');")

};

exports.down = pgm => {};
