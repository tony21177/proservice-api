require('../firebase')
const { async } = require('@firebase/util')
const {getAuth,signInWithEmailAndPassword} = require('firebase/auth')
const {firebaseAdmin} = require('../firebase')
const {logger} = require('../logger')
const {updateLastLoginTime} = require('../datastore/postgres/users')
const {getPublicKeyByMac,insertOrUpdateDeviceByMac} = require('../datastore/postgres/devices')
const jwt = require('jsonwebtoken')
const base64url = require('base64url');
const fs = require('fs')
const { config } = require('../config/env')

exports.authUserEmailAndPass = async(email,password)=>{
    logger.info("authUserEmailAndPass..")
    try{
        const auth = getAuth()
        const userCredential = await signInWithEmailAndPassword(auth,email,password)
        const user = userCredential.user;
        const token = await user.getIdToken();
        return {accesssToken:token,uid:user.uid}
    }catch(error){
        logger.error("authUserEmailAndPass errorCode:%s,errorMessage",error.code,error.message)
        throw Error("auth error:"+error.code)
    }
    
}

exports.verifyToken = async (token)=>{
    try{
        let decodedToken = await firebaseAdmin.auth().verifyIdToken(token)
        const uid = decodedToken.uid;
        const email = decodedToken.email;
        await updateLastLoginTime(uid, email)
    }catch(error){
        logger.error("verifyToken error:",error)
        throw error
    }
    
}

exports.tokenProtect = async (req, res, next) => {
    try {
        // 1) check if the token is there
        let token;
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            token = req.headers.authorization.split(" ")[1];
        }
        if (!token) {
            res.status(401).json({
                success: false,
                data: {
                    msg: "沒有權限"
                },
            })
            return
        }

        // 2) Verify token
        firebaseAdmin.auth()
        .verifyIdToken(token)
        .then((decodedToken) => {
            const uid = decodedToken.uid;
            // ...
            req.uid = uid
            req.email = decodedToken.email
            next();
        })
        .catch((error) => {
            res.status(401).json({
                success: false,
                data: {
                    msg: error.message
                },
            })
            return
            // Handle error
        });
    } catch (err) {
        next(err);
    }
};

exports.tokenProtectForDevice = async (req, res, next) => {
    try {
        // 1) check if the token is there
        let token;
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            token = req.headers.authorization.split(" ")[1];
        }
        if (!token) {
            res.status(401).json({
                success: false,
                data: {
                    msg: "jwt token is required"
                },
            })
            return
        }

        // 2) Verify token
        let base64urlPayload = token.split('.')[1];
        let decodedPayload = JSON.parse(base64url.decode(base64urlPayload, 'utf8'))
        let mac = decodedPayload.mac
        let publicKey;
        if(config.tokenEnv == "develope"){
            publicKey = fs.readFileSync('/etc/publickey/develope.pem')
        }else{
            if(!fs.existsSync("/etc/publickey/"+mac+".pem")){
                res.status(401).json({
                    success: false,
                    data: {
                        msg: "the device is not valid(mac="+mac+")"
                    },
                })
            }
            publicKey = fs.readFileSync("/etc/publickey/"+mac+".pem")
        }

        let decoded = ""
        try{
            decoded = jwt.verify(token,publicKey,{ algorithms: ['RS256']})
            const updatedResult = await insertOrUpdateDeviceByMac(decoded.loc,decoded.ip,decoded.hostname,decoded.mac)
            logger.info("updatedResult:",updatedResult.rowCount)
            req.location = decoded.loc;
            next()
        }catch(error){
            logger.error("jwt verificaton error:",error)
            res.status(401).json({
                success: false,
                data: {
                    msg: error.message
                },
            })
            return
        }
    } catch (err) {
        logger.error("tokenProtectForDevice err:",err)
        next(err);
    }
};