const firebaseAdmin = require('firebase-admin');
const serviceAccount =require("./adminConfig.json")


// firebase admin
firebaseAdmin.initializeApp({	
    credential: firebaseAdmin.credential.cert(serviceAccount)
});



const { initializeApp } =require('firebase/app');
const firebaseConfig = require("./appConfig.json");

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

module.exports = {firebaseAdmin,firebaseApp}