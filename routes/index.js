const express = require("express");
const router = express.Router();
const eventProcesser = require('../controller/eventProcesserController')
const authService = require('../controller/authController')
const {tokenProtect,tokenProtectForDevice} = require('../auth/authenticate')
const userService = require('../controller/userController')
const {logger} = require('../logger')

// restful api for collecting event without authentication
router.post("/api/v1/event",eventProcesser.saveEvent);
// restful api for collecting event with authentication
router.post("/api/v1/auth/event",tokenProtectForDevice,eventProcesser.saveEvent);
// restful api for scroll events list
router.post("/api/v1/event/list",tokenProtect,eventProcesser.scrollEvents)
router.post("/api/v1/event/sync",tokenProtect,eventProcesser.syncEvents)

// restful api for text/plain
router.post("/api/v2/event",eventProcesser.saveRawEvent);


// auth
router.post("/api/v1/auth/login",authService.login)
router.get("/api/v1/auth/login/token",authService.verifyToken);

// fcm token
router.post("/api/v1/fcm/token_upload",tokenProtect,userService.bindFcmToken)


module.exports = router