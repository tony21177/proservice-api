const db = require('./index')
const {logger} = require('../../logger')
exports.upsertUserFcmToken = async (uid,fcmToken,envId="",envLocation="",envInfo="")=>{
    let result="";
    try {
        result = await db.query('insert into "user_fcm_token" (uid,"fcmToken","envId","envLocation","envInfo") values($1,$2,$3,$4,$5)  ON CONFLICT (uid,"fcmToken") DO UPDATE SET "updatedAt"=now(), "envId" =$3, "envLocation"=$4,"envInfo"=$5', [uid,fcmToken,envId,envLocation,envInfo]);
    } catch (e) {
        logger.error("insertUserOrUpdateLastLoginTime error", e.message);
        throw e;
    }

    return result
}

exports.getAllFcmTokens = async ()=>{
    let result="";
    try {
        result = await db.query('select "fcmToken" from "user_fcm_token"');
        if(result.rowCount==0) return [];
        const tokens = result.rows.map(ele=>ele.fcmToken)
        logger.debug("all tokens array:",tokens)
        return tokens
    } catch (e) {
        logger.error("getAllFcmTokens error", e.message);
        throw e;
    }
}