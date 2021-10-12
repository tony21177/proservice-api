/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.createTable('user_fcm_token', {
        id: 'id',
        uid: { type: 'varchar(1000)', notNull: true },
        fcmToken: { type: 'varchar(300)', notNull: true },
        envId: { type: 'varchar(100)' },
        envLocation: { type: 'varchar(100)' },
        envInfo: { type: 'text' },
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
    pgm.addConstraint('user_fcm_token', 'unique_uid_token', 'UNIQUE (uid,"fcmToken")')

};

exports.down = pgm => { };
