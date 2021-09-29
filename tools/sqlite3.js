const { insertEventLog, scrollEvents } = require('../datastore/elasticsearch/event')
var sqlite3 = require('sqlite3').verbose();
const xml2js = require('xml2js');

let logDb = new sqlite3.Database('./tools/DataLog.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the my database.');
});


logDb.serialize(() => {
    logDb.each(`select raw from logs`, async (err, row) => {
        if (err) {
            console.log("sql error")
            console.error(err.message);
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
                // console.log("parse Body  error:", err)
                return
            }
            // add Detail
            try {
                const text = result['IAMessage']['Body']['Data']['#text'].replace(/\t/g,'').replace(/\n/g,'')
                const rootText = "<root>"+text+"</root>"
                let infoObjecty = await xml2js.parseStringPromise(rootText, parseOption);
                result['Detail'] = { ['Info']: infoObjecty.root }
                console.log(result.Detail.Info.FirstOccurrence)
                if(result.Detail.Info.FirstOccurrence=="Unknown"){
                    delete result.Detail.Info.FirstOccurrence
                    console.log(result)
                }
            } catch (err) {
                console.log("parse Detail error:", err)
            }

            try {
                const response = await insertEventLog(9, 26, result);
            } catch (err) {
                console.log("insert es error")
                console.log(err)
            }

        }

    });
})
