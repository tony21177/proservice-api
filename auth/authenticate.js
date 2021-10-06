require('../firebase')
const {getAuth,signInWithEmailAndPassword} = require('firebase/auth')
const {firebaseAdmin} = require('../firebase')

exports.authUserEmailAndPass = async(email,password)=>{
    console.log("authUserEmailAndPass..")
    try{
        const auth = getAuth()
        const userCredential = await signInWithEmailAndPassword(auth,email,password)
        const user = userCredential.user;
        const token = await user.getIdToken();
        return {accesssToken:token,uid:user.uid}
    }catch(error){
        console.error("authUserEmailAndPass errorCode:%s,errorMessage",error.code,error.message)
        throw Error("auth error:"+error.code)
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
            // Handle error
        });

        
    } catch (err) {
        next(err);
    }
};