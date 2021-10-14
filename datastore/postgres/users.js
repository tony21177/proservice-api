const db = require('./index')
const {logger} = require('../../logger')

exports.insertUserOrUpdateLastLoginTime = async (uid,email,role,authType) => {
    let result="";
    try {
        result = await db.query('insert into users(uid,email,role,"authType") values($1,$2,$3,$4)  ON CONFLICT (email) DO UPDATE SET "lastLoginTime" =now() returning id', [uid,email,role,authType]);
    } catch (e) {
        logger.error("insertUserOrUpdateLastLoginTime error", e.message);
        throw e;
    }

    return result
}

exports.insertUser = async (uid,email,role,authType) => {
    let result="";
    try {
        result = await db.query('insert into users(uid,email,role,"authType") values($1,$2,$3,$4)', [uid,email,role,authType]);
    } catch (e) {
        logger.error("insertUser error", e.message);
        throw e;
    }
    return result
}

