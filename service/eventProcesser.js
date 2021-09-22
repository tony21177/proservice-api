const {insertEventLog,scrollEvents} = require('../datastore/elasticsearch/event')
const dayjs = require('dayjs')
var utc = require('dayjs/plugin/utc')
var timezone = require('dayjs/plugin/timezone') // dependent on utc plugin
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault("Asia/Taipei")



exports.saveEvent = async (req, res, next) => {
    let eventData = req.body;
    console.log("eventData",eventData)
    let todayTW = dayjs();
    const result = await insertEventLog(todayTW.month()+1,todayTW.date(),eventData);
    console.log("es result",result)
    
    res.status(200).json({
        status: 200,
        success: true,
        data: null
    })
}

exports.scrollEvents = async(req,res,next) => {
    const data = await scrollEvents(null,null,null)
    res.status(200).json({
        status: 200,
        success: true,
        data: data
    })
}