const {insertEventLog,scrollEvents} = require('../datastore/elasticsearch/event')
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
            xml2js.parseString(raw.replace("\ufeff", ""), parseOption, async (err, result) => {
                if (err) {
                    console.log("parse xml error")
                    console.log(err)
                    console.log("----------------------------------")
                    console.log(raw)
                }else{
                    try{
                     const response = await insertEventLog(9,26,result);
                     console.log('es response:',response)
                    }catch(err){
                        console.log("insert es error")
                        console.log(err)
                    }
                }
            })
        }

    });
})
