const { insertEventLog } = require('../datastore/elasticsearch/event')
var sqlite3 = require('sqlite3').verbose();
const xml2js = require('xml2js');
const {logger} = require('../logger');
const e = require('express');

let logDb = new sqlite3.Database('./tools/DataLog.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        logger.error(err.message);
    }
    logger.info('Connected to the my database.');
});

let errorCount = 0;
logDb.serialize(() => {
    logDb.each(`SELECT time,raw from logs where json = "Error in parse Json String"`, async (err, row) => {
        if(errorCount>3) return
        if (err) {
            logger.error("sql error:",err.message);
        }
        let time = row.time
        let timeStamp = new Date(time).getTime()
        let month =time.split('-')[1]
        let day = time.split('-')[2]
        let raw = row.raw
        if (raw != 'Raw String') {
            const parseOption = {
                explicitArray: false,
                ignoreAttrs: false,
                mergeAttrs: true,
                charkey: '#text',
                attrNameProcessors: [function (name) { return '@' + name }]
            }
            // parse Body
            let result;
            try {
                result = await xml2js.parseStringPromise(raw.replace("\ufeff", ""), parseOption);
            } catch (err) {
                errorCount++;
                logger.error("parse Body  error:", err)
                console.log(raw.replace("\ufeff", ""))
                console.log("************errorCount:%d",errorCount)
                return
            }
            // add Detail
            try {
                const text = result['IAMessage']['Body']['Data']['#text'].replace(/\t/g,'').replace(/\n/g,'')
                const rootText = "<root>"+text+"</root>"
                let infoObjecty = await xml2js.parseStringPromise(rootText, parseOption);
                result['IAMessage']['Detail'] = { ['Info']: infoObjecty.root }
                if(result.IAMessage.Detail.Info.FirstOccurrence=="Unknown"){
                    delete result.IAMessage.Detail.Info.FirstOccurrence
                }
            } catch (err) {
                logger.error("parse Detail error:", err)
            }

            try {
                const response = await insertEventLog(month, day, result,timeStamp,"cmuh");
            } catch (err) {
                logger.error("insert es error:",err)
            }

        }

    });
})

