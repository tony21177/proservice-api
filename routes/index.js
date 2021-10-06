const express = require("express");
const router = express.Router();
const eventProcesser = require('../service/eventProcesser')
const authService = require('../service/authService')

// restful api for mqtt
router.post("/api/v1/event",eventProcesser.saveEvent);
// restful api for scroll events list
router.post("/api/v1/event/list",eventProcesser.scrollEvents)
router.post("/api/v1/event/sync",eventProcesser.syncEvents)

// restful api for text/plain
router.post("/api/v2/event",eventProcesser.saveRawEvent);


// auth
router.post("/api/v1/auth/login",authService.login)


module.exports = router