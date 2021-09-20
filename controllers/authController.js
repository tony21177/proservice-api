// const { promisify } = require("util");
const jwt = require("jsonwebtoken");
// const User = require("../models/userModel");
// const AppError = require("../utils/appError");
const { admin, firebase } = require("../firebase")
const { credential } = require("firebase-admin");
const db = require('../db')



exports.emailLogin = async (req, res, next) => {
    try {
        const authService = firebase.auth();
        var actionCodeSettings = {
            // URL you want to redirect back to. The domain (www.example.com) for this
            // URL must be in the authorized domains list in the Firebase Console.
            url:  req.protocol + '://' + req.get('host') + "/verification",
            // This must be true.
            handleCodeInApp: true,
            // iOS: {
            //     bundleId: 'com.example.ios'
            // },
            // android: {
            //     packageName: 'com.example.android',
            //     installApp: true,
            //     minimumVersion: '12'
            // },
            // dynamicLinkDomain: 'example.page.link'
        };

        const { email } = req.body;
        authService.sendSignInLinkToEmail(email, actionCodeSettings)
            .then(async response => {
                // const { rows } = await db.query('insert into users(email) values($1)  ON CONFLICT (email) DO UPDATE SET "createdAt" =now() returning id', [email]);
                // console.log("id:", rows[0].id)
                res.cookie('email', email, { maxAge: 3600000, httpOnly: true });
                res.status(200).json({
                    success: true,
                    data: {
                        msg: "已將登入信件寄至您的信箱"
                    },
                })
            })
            .catch((error) => {
                console.log("sendSignInLinkToEmail error:errorCode:" + error.code + ",message:" + error.message);
                res.status(400).json({
                    success: false,
                    data: {
                        msg: error.message
                    },
                })
            })


    } catch (err) {
        next(err);
    }


}


exports.passwordLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        firebase.auth().signInWithEmailAndPassword(email, password)
            .then(async userCredential => {
                // Signed in
                const user = userCredential.user;
                const email = user.email;
                const token = await user.getIdToken();
                const uid = user.uid


                try {
                    const { rows } = await db.query('insert into users(uid,email) select $1 as uid,$2 as email where not exists  (select 1 from users where email = $3) returning id', [uid,email, email]);
                } catch (e) {
                    console.log("database error", e.message);
                    res.status(400).json({
                        success: true,
                        data: {
                            msg: e.message
                        },
                    })
                }

                res.cookie('token', token, { maxAge: 36000000, httpOnly: true });
                res.set('token', token);
                res.status(200).json({
                    status: "success",
                    data: {
                        user,
                        token
                    },
                });
            })
            .catch((error) => {
                var errorCode = error.code;
                var errorMessage = error.message;
                res.status(401).json({
                    status: "false",
                    data: {
                        errorCode,
                        errorMessage
                    },
                });
            });

    } catch (err) {
        next(err);
    }
};

exports.signup = async (req, res, next) => {
    const { email, password } = req.body
    var actionCodeSettings = {
        // URL you want to redirect back to. The domain (www.example.com) for this
        // URL must be in the authorized domains list in the Firebase Console.
        url:  req.protocol + '://' + req.get('host') + "/verification",
        // This must be true.
        handleCodeInApp: true,
        // iOS: {
        //     bundleId: 'com.example.ios'
        // },
        // android: {
        //     packageName: 'com.example.android',
        //     installApp: true,
        //     minimumVersion: '12'
        // },
        // dynamicLinkDomain: 'example.page.link'
    };

    const authService = firebase.auth();

    authService.createUserWithEmailAndPassword(email, password)
        .then(credential => {
            // console.log(credential);
            const user = credential.user;
            const uid = user.uid;
            user.sendEmailVerification(actionCodeSettings)
                .then(async response => {
                    try {
                        const { rows } = await db.query('insert into users(uid,email) values($1,$2)  ON CONFLICT (email) DO UPDATE SET "createdAt" =now() returning id', [uid,email]);
                        console.log("id:", rows[0].id)
                        res.status(200).json({
                            success: true,
                            data: {
                                msg: "註冊成功,已將驗證信寄至您的信箱"
                            },
                        })
                    } catch (e) {
                        console.log("database error", e.message);
                        res.status(400).json({
                            success: true,
                            data: {
                                msg: e.message
                            },
                        })
                    }
                })
                .catch((error) => {
                    console.log("sendEmailVerification error:errorCode:" + error.code + ",message:" + error.message);
                    res.status(400).json({
                        success: false,
                        data: {
                            msg: error.message
                        },
                    })
                })

        })
        .catch(error => {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            switch (errorCode) {
                case 'auth/weak-password':
                    res.status(400).json({
                        success: false,
                        data: {
                            msg: "密碼強度太弱"
                        },
                    })
                    break;
                case 'auth/email-already-in-use':
                    res.status(400).json({
                        success: false,
                        data: {
                            msg: "此郵件已被使用"
                        },
                    })
                    break;
                case 'auth/invalid-email':
                    res.status(400).json({
                        success: false,
                        data: {
                            msg: "無效的郵件"
                        },
                    })
                    break;
                default:
                    console.log("createUserWithEmailAndPassword errorCode:" + errorCode + ",errorMessage:" + errorMessage);
                    break;

            }

        })



};

exports.emailVerify = async (req, res, next) => {
    const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;

    // sign in by email
    if (firebase.auth().isSignInWithEmailLink(fullUrl)) {
        const email = req.cookies.email;

        firebase.auth().signInWithEmailLink(email, fullUrl)
            .then(async result => {
                const token = await result.user.getIdToken();
                const uid = result.user.uid;
                try {
                    const { rows } = await db.query('insert into users(uid,email) values($1,$2)  ON CONFLICT (email) DO UPDATE SET "createdAt" =now() returning id', [uid,email]);
                    console.log("id:", rows[0].id)
                    res.cookie('token', token, { maxAge: 36000000 });
                    res.set('token', token);
                    res.redirect(302, req.protocol + '://' + req.get('host') + "/profile?token="+token);
                } catch (e) {
                    console.log("database error", e.message);
                    res.status(400).json({
                        success: true,
                        data: {
                            msg: e.message
                        },
                    })
                }
            })
            .catch((e) => {
                console.log(e)
                res.status(400).json({
                    success: false,
                    data: {
                        msg: e.message
                    },
                })
                // Some error occurred, you can inspect the code: error.code
                // Common errors could be invalid email and invalid or expired OTPs.
            });

    } else {
        res.redirect(302, req.protocol + '://' + req.get('host') + "/login");
    }

}





const createToken = id => {
    return jwt.sign(
        {
            id,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN,
        },
    );
};

exports.protect = async (req, res, next) => {
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
        admin.auth()
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
