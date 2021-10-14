const { insertEventLog, scrollEvents } = require('../datastore/elasticsearch/event')
var sqlite3 = require('sqlite3').verbose();
const xml2js = require('xml2js');
const {logger} = require('../logger')

let logDb = new sqlite3.Database('./tools/DataLog.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        logger.error(err.message);
    }
    logger.info('Connected to the my database.');
});


logDb.serialize(() => {
    logDb.each(`select raw from logs`, async (err, row) => {
        if (err) {
            logger.error("sql error:",err.message);
        }
        let raw = row.raw;
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
                logger.error("parse Body  error:", err)
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
                const response = await insertEventLog(9, 26, result);
            } catch (err) {
                logger.error("insert es error:",err)
            }

        }

    });
})
