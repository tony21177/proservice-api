const {authUserEmailAndPass}=require('../auth/authenticate')


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
    console.log("vlidate success")
    try{
        const result = await authUserEmailAndPass(req.body.email,req.body.password);
        console.log(result)
        res.status(200).json({
            success: true,
            data: {
                msg: result
            },
        })
    }catch(error){
        console.log("auth fail:",error)
        res.status(400).json({
            success: false,
            data: {
                msg: error.message
            },
        })
    }
}