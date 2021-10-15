const { insertEventLog,insertFailedEventLog,insertRawEventLog, scrollEvents, syncEvents } = require('../datastore/elasticsearch/event')
const dayjs = require('dayjs')
const xml2js = require('xml2js');
const {publishNewestEvent} = require('../mqtt/mqtt')
const {getAllFcmTokens} = require('../datastore/postgres/user_fcm')
const {publicLatestEvent,publicLatestEventToDevices} = require('../firebase/fcm')
const {logger} = require('../logger')
var utc = require('dayjs/plugin/utc')
var timezone = require('dayjs/plugin/timezone') // dependent on utc plugin
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault("Asia/Taipei")




exports.saveEvent = async (req, res, next) => {
    let eventData = req.body;
    let todayTW = dayjs();
    let result = ""
    const indexTimestamp = new Date().getTime();
    try {
        result = await insertEventLog(todayTW.month() + 1, todayTW.date(), eventData,indexTimestamp);
    } catch (ex) {
        logger.error("insert ES fail", ex)
        logger.error("eventData:",eventData)
        insertFailedEventLog(todayTW.month() + 1, todayTW.date(), eventData,indexTimestamp);
        res.status(500).json({
            status: 500,
            success: false,
            data: ex
        })
        return
    }
    // publish newest event doc id to mqtt
    const docId = result.body['_id']
    logger.info("docId:",docId);
    publishNewestEvent(docId,indexTimestamp);
    publicLatestEvent(docId,indexTimestamp);
    const tokenArray = await getAllFcmTokens();
    publicLatestEventToDevices(docId,indexTimestamp,tokenArray)

    res.status(200).json({
        status: 200,
        success: true,
        data: null
    })
}

exports.saveRawEvent = async (req, res, next) => {
    const rawBodyBuf = req.rawBody;
    let xml;
    try {
        xml = rawBodyBuf.toString('latin1');
    } catch (ex) {
        logger.error("toString fail", ex)
        res.status(500).json({
            status: 500,
            success: false,
            data: ex
        })
    }
    const parseOption = {
        explicitArray: false,
        ignoreAttrs: false,
        mergeAttrs: true,
        charkey: '#text',
        attrNameProcessors: [function (name) { return '@' + name }]
    }
    //
    let result;
    try {
        // parse Body
        result = await xml2js.parseStringPromise(xml.replace("\ufeff", ""), parseOption);
        result['isRawISO88591'] = true
    } catch (err) {
        logger.error("parse xml error:", err);
        res.status(500).json({
            status: 500,
            success: false,
            data: err
        })
        return
    }
    // add Detail
    try {
        const text = result['IAMessage']['Body']['Data']['#text'].replace(/\t/g, '').replace(/\n/g, '')
        const rootText = "<root>" + text + "</root>"
        let infoObjecty = await xml2js.parseStringPromise(rootText, parseOption);
        result['Detail'] = { ['Info']: infoObjecty.root }
        if (result.Detail.Info.FirstOccurrence == "Unknown") {
            delete result.Detail.Info.FirstOccurrence
        }
    } catch (err) {
        logger.error("parse Detail error:", err)
        res.status(500).json({
            status: 500,
            success: false,
            data: err
        })
        return
    }

    // insert to ES
    try {
        let todayTW = dayjs();
        result = await insertRawEventLog(todayTW.month() + 1, todayTW.date(), result);
    } catch (err) {
        logger.error("insert into ES error:", err)
        res.status(500).json({
            status: 500,
            success: false,
            data: err
        })
        return
    }



    res.status(200).json({
        status: 200,
        success: true,
        data: null
    })
    return

}

exports.syncEvents = async (req, res, next) => {
    const size = req.body.size;
    const lastId = req.body.lastId;
    const indexTimestamp = req.body.indexTimestamp;
    let data;
    try {
        data = await syncEvents(size,lastId,indexTimestamp)
    } catch (error) {
        logger.error("syncEvents error:",error)
        if (error.toString()=="lastId and indexTimestamp is required") {
            res.status(400).json({
                status: 400,
                success: false,
                data: error
            })
            return
        }
        res.status(500).json({
            status: 500,
            success: false,
            data: error
        })
        return
    }
    res.status(200).json({
        status: 200,
        success: true,
        data: data
    })
}


exports.scrollEvents = async (req, res, next) => {
    const lastId = req.body.lastId;
    const indexTimestamp = req.body.indexTimestamp;
    const from = req.body.from;
    const size = req.body.size;
    const scrollId = req.body.scrollId;
    let data;
    try {
        data = await scrollEvents(from, size, scrollId)
    } catch (error) {
        logger.info("scrollEvents error:",error)
        if (typeof error.meta!='undefined'&&error.meta.body.error.root_cause[0] && error.meta.body.error.root_cause[0].type == 'search_context_missing_exception') {
            res.status(400).json({
                status: 400,
                success: false,
                data: "scroll to end already..."
            })
            return
        }
        res.status(500).json({
            status: 500,
            success: false,
            data: error
        })
        return
    }
    res.status(200).json({
        status: 200,
        success: true,
        data: data
    })
}

