const {insertEventLog,scrollEvents} = require('../datastore/elasticsearch/event')
const dayjs = require('dayjs')
const xml2js = require('xml2js');
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

exports.saveRawEvent = async(req, res, next)=>{
    const rawBodyBuf = req.rawBody;
    console.log("rawBodyBuf:",rawBodyBuf)
    let xml;
    try{
        xml = rawBodyBuf.toString('latin1');
    }catch(ex){
        console.log("toString fail",ex)
        res.status(500).json({
            status: 500,
            success: false,
            data: ex
        })
    }
    console.log("xml raw data:",xml)
    xml2js.parseString(xml, async (err, result) => {
        if(err) {
            console.log("parse xml error:",err);
            res.status(500).json({
                status: 500,
                success: false,
                data: err
            })
        }
        result['isRawISO88591'] = true
        console.log("successful result:"+result)
        let todayTW = dayjs();
        result = await insertEventLog(todayTW.month()+1,todayTW.date(),result);
        console.log("es result",result)
        
        res.status(200).json({
            status: 200,
            success: true,
            data: null
        })
    
        
    });

}

exports.scrollEvents = async(req,res,next) => {
    const from = req.body.from;
    const size = req.body.size;
    const scrollId = req.body.scrollId;
    let data;
    try {
        data = await scrollEvents(from,size,scrollId)
    }catch (error) {
        console.log(`scrollEvents error: ${error}`);
        if(error instanceof CustomExceptionError){
            res.status(400).json({
                status: 400,
                success: false,
                data: "scroll to end already..."
            })
        }
        res.status(500).json({
            status: 500,
            success: false,
            data: error
        })
    }
    res.status(200).json({
        status: 200,
        success: true,
        data: data
    })
}

