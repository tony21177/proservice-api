const { insertEventLog, scrollEvents } = require('../datastore/elasticsearch/event')
const dayjs = require('dayjs')
const xml2js = require('xml2js');
const {publishNewestEvent} = require('../mqtt/mqtt')
var utc = require('dayjs/plugin/utc')
var timezone = require('dayjs/plugin/timezone') // dependent on utc plugin
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault("Asia/Taipei")




exports.saveEvent = async (req, res, next) => {
    let eventData = req.body;
    // console.log("eventData", eventData)
    let todayTW = dayjs();
    let result = ""
    try {
        result = await insertEventLog(todayTW.month() + 1, todayTW.date(), eventData);
        // console.log("result:", result)
    } catch (ex) {
        console.log("insert ES fail", ex)
        res.status(500).json({
            status: 500,
            success: false,
            data: ex
        })
        return
    }
    // publish newest event doc id to mqtt
    const docId = result.body['_id']
    console.log("docId:",docId);
    publishNewestEvent(docId);

    res.status(200).json({
        status: 200,
        success: true,
        data: null
    })
}

exports.saveRawEvent = async (req, res, next) => {
    const rawBodyBuf = req.rawBody;
    console.log("rawBodyBuf:", rawBodyBuf)
    let xml;
    try {
        xml = rawBodyBuf.toString('latin1');
    } catch (ex) {
        console.log("toString fail", ex)
        res.status(500).json({
            status: 500,
            success: false,
            data: ex
        })
    }
    console.log("xml raw data:", xml)
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
        console.log("successful result:" + result)
    } catch (err) {
        console.log("parse xml error:", err);
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
        console.log(result.Detail.Info.FirstOccurrence)
        if (result.Detail.Info.FirstOccurrence == "Unknown") {
            delete result.Detail.Info.FirstOccurrence
        }
    } catch (err) {
        console.log("parse Detail error:", err)
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
        console.log("es result", result)
    } catch (err) {
        console.log("insert into ES error:", err)
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

exports.scrollEvents = async (req, res, next) => {
    const from = req.body.from;
    const size = req.body.size;
    const scrollId = req.body.scrollId;
    let data;
    try {
        data = await scrollEvents(from, size, scrollId)
    } catch (error) {
        console.log(error)
        if (error.meta.body.error.root_cause[0] && error.meta.body.error.root_cause[0].type == 'search_context_missing_exception') {
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

