const express = require("express");
const router = express.Router();
const eventProcesser = require('../service/eventProcesser')



// restful api for mqt
router.post("/api/v1/event",eventProcesser.saveEvent);



module.exports = router