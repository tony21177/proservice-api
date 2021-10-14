const {authUserEmailAndPass}=require('../auth/authenticate')
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