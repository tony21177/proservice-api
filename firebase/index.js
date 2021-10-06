const firebaseAdmin = require('firebase-admin');
const serviceAccount =require("./adminConfig.json")


// firebase admin
firebaseAdmin.initializeApp({	
    credential: firebaseAdmin.credential.cert(serviceAccount)
});



//firebase app
// Import the functions you need from the SDKs you need
const { initializeApp } =require("firebase/app");
require("firebase/auth");
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = require("./appConfig.json");

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

module.exports = {firebaseAdmin,firebaseApp}