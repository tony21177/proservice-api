/* eslint-disable camelcase */

exports.shorthands = undefined;
const {roleConstant} = require('../auth/role')

exports.up = pgm => {
  pgm.createTable('roles', {
    id: 'id',
    role: { type: 'varchar(100)', notNull: true, unique: true },
    description: { type: 'varchar(100)', notNull: false },
    createdAt: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    }
  })
  pgm.sql("INSERT INTO roles (id,role, description) VALUES (1,'{role}' ,'administrator');",{role:roleConstant.administor})
  pgm.sql("INSERT INTO roles (id,role, description) VALUES (2,'{role}' ,'normal user');",{role:roleConstant.generalUser})

  pgm.createTable('users', {
    id: 'id',
    uid: { type: 'varchar(1000)', notNull: true, unique: true },
    email: { type: 'varchar(1000)', notNull: true, unique: true },
    password:{ type: 'varchar(1000)', notNull: false},
    authType:{ type: 'smallint', notNull: true,default:0,comment:"0:firebase,"},
    role: {type: 'integer',notNull:true},
    multiFactorEnabled: {type:'boolean',default:false,notNull:true},
    createdAt: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    lastLoginTime: {
      type: 'timestamp',
      notNull: false,
      default: null,
    },
  })

};

exports.down = pgm => { };
