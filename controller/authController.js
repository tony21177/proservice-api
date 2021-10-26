const { async } = require('@firebase/util')
const {authUserEmailAndPass,verifyToken}=require('../auth/authenticate')
const {logger} = require('../logger')

exports.login = async (req, res, next)=>{
    if(!req.body.email||!req.body.password||req.body.email.trim()==""||req.body.password==""){
        res.status(400).json({
            success: false,
            data: {
                msg: "email and password is required and can not be empty"
            },
        })
        return
    }
    try{
        const result = await authUserEmailAndPass(req.body.email,req.body.password);
        res.status(200).json({
            success: true,
            data: {
                msg: result
            },
        })
    }catch(error){
        logger.info("auth fail:",error)
        res.status(400).json({
            success: false,
            data: {
                msg: error.message
            },
        })
    }
}

exports.verifyToken = async  (req, res, next) => {
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
                "message": "lack of bearer token",
            },
        })
        return
    }
    try{
        await verifyToken(token)
        res.status(200).json({
            success: true,
            data: {
                message: "success"
            }
        })
    }catch(error){
        res.status(401).json({
            success: false,
            data: {
                message: error.message,
            },
        })
    }
}
