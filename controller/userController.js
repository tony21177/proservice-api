const e = require('express')
const {upsertUserFcmToken} = require('../datastore/postgres/user_fcm')
const {logger} = require('../logger')
exports.bindFcmToken = async (req, res, next)=>{
    if(!req.body.fcmToken||req.body.fcmToken.trim()==""){
        res.status(400).json({
            success: false,
            data: {
                msg: "fcmToken is required"
            },
        })
    }

    const result = await upsertUserFcmToken(req.uid,req.body.fcmToken,req.body.envId,req.body.envLocation,req.body.envInfo)
    logger.debug("upsertUserFcmToken:",result)
    if(result.rowCount==1){
        res.status(200).json({
            success: true,
            data: {
                msg: null
            },
        })
    }else{
        res.status(500).json({
            success: false,
            data: {
                msg: "Fail to bind Token,Please contact Administrator"
            },
        })
    }
}