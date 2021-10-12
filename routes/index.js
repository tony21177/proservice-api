const express = require("express");
const router = express.Router();
const eventProcesser = require('../controller/eventProcesserController')
const authService = require('../controller/authController')
const {tokenProtect} = require('../auth/authenticate')
const userService = require('../controller/userController')

// restful api for mqtt
router.post("/api/v1/event",eventProcesser.saveEvent);
// restful api for scroll events list
router.post("/api/v1/event/list",tokenProtect,eventProcesser.scrollEvents)
router.post("/api/v1/event/sync",tokenProtect,eventProcesser.syncEvents)

// restful api for text/plain
router.post("/api/v2/event",eventProcesser.saveRawEvent);


// auth
router.post("/api/v1/auth/login",authService.login)

// fcm token
router.post("/api/v1/fcm/token_upload",tokenProtect,userService.bindFcmToken)


module.exports = router