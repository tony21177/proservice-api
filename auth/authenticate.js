require('../firebase')
const {getAuth,signInWithEmailAndPassword} = require('firebase/auth')

exports.authUserEmailAndPass = async(email,password)=>{
    try{
        const auth = getAuth()
        const userCredential = await signInWithEmailAndPassword(auth,email,password)
        const user = userCredential.user;
        const token = await user.getIdToken();
        return {accesssToken:token,uid:result.user.uid}
    }catch(error){
        console.error("authUserEmailAndPass errorCode:%s,errorMessage",error.code,error.message)
        throw Error("auth error:"+error.message)
    }
    
}

exports.authUserEmailAndPass("admin@lis.com","lis123")