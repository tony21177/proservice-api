const { esClient } = require('./esclient')
const util = require('util');

const insertEventLog = async (month,day,data) =>{
    const response = await esClient.index({
        index: "event_"+month+"_"+day,
        op_type: 'create',
        refresh: 'true' ,
        body: data
      })
    return response  
}
exports.insertEventLog = insertEventLog