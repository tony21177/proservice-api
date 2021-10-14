const firebaseAdmin = require('firebase-admin');
const serviceAccount =require("./adminConfig.json")
const {logger} = require('../logger')

// firebase admin
firebaseAdmin.initializeApp({	
    credential: firebaseAdmin.credential.cert(serviceAccount)
});



const { initializeApp } =require('firebase/app');
const firebaseConfig = require("./appConfig.json");

// Initialize Firebase
logger.info("firebase initialize...")
const firebaseApp = initializeApp(firebaseConfig);

module.exports = {firebaseAdmin,firebaseApp}