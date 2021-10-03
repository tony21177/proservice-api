const express = require("express");
const router = express.Router();
const eventProcesser = require('../service/eventProcesser')


// restful api for mqtt
router.post("/api/v1/event",eventProcesser.saveEvent);
// restful api for scroll events list
router.post("/api/v1/event/list",eventProcesser.scrollEvents)

// restful api for text/plain
router.post("/api/v2/event",eventProcesser.saveRawEvent);



module.exports = router