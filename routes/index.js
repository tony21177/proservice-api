const express = require("express");
const router = express.Router();
const eventProcesser = require('../service/eventProcesser')



// restful api for mqtt
router.post("/api/v1/event",eventProcesser.saveEvent);
// restful api for scroll events list
router.post("/api/v1/event/list",eventProcesser.scrollEvents)



module.exports = router