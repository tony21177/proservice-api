require('../firebase')
const {getAuth,signInWithEmailAndPassword} = require('firebase/auth')

exports.authUserEmailAndPass = async(email,password)=>{
    console.log("authUserEmailAndPass..")
    console.log("email:%s,password:%s",email,password)
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
