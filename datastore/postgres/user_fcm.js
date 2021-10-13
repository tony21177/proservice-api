const { async } = require('@firebase/util')
const db = require('./index')

exports.upsertUserFcmToken = async (uid,fcmToken,envId="",envLocation="",envInfo="")=>{
    let result="";
    try {
        result = await db.query('insert into "user_fcm_token" (uid,"fcmToken","envId","envLocation","envInfo") values($1,$2,$3,$4,$5)  ON CONFLICT (uid,"fcmToken") DO UPDATE SET "updatedAt"=now(), "envId" =$3, "envLocation"=$4,"envInfo"=$5', [uid,fcmToken,envId,envLocation,envInfo]);
    } catch (e) {
        console.log("insertUserOrUpdateLastLoginTime error", e.message);
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
        console.log("all tokens array:",tokens)
        return tokens
    } catch (e) {
        console.log("getAllFcmTokens error", e.message);
        throw e;
    }
}