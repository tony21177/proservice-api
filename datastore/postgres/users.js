const db = require('./index')
const {logger} = require('../../logger')

exports.updateLastLoginTime = async (uid,email) => {
    let result="";
    try {
        result = await db.query('select * from users where email = $1',[email])
        if(result.rowCount==0){
            throw new Error("the user doesn't exist")
        }
        result = await db.query('update users  SET "lastLoginTime" =now() where uid = $1 and email = $2', [uid,email]);
    } catch (e) {
        logger.error("updateLastLoginTime error", e.message);
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

