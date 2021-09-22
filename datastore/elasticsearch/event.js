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

const scrollEvents = async (from,size,scrollId) => {
    // first 
    if(!scrollId||scrollId.trim()==''){
      if(!Number.isInteger(size)){
        size = 10;
      }  
      if(!Number.isInteger(from)){
        from = 0;
      } 
      const result = await esClient.search({
        index: 'event*',
        sort: ['Timestamp:desc'],
        from: 10,
        size: 5,
        scroll:'10m',
        scrollId:'FGluY2x1ZGVfY29udGV4dF91dWlkDXF1ZXJ5QW5kRmV0Y2gBFjdGbDBNSjlHU20yZU0yRGt2aENPaFEAAAAAAAABGhZ5ZlFNcEZUMlQ4eUtKNmRGZDV2T053'
      }, {
        ignore: [404],
        maxRetries: 1
      })
      console.log(result)
    }else{
      // next
      
    }

    
    const result = await esClient.scroll({
      scroll_id: 'FGluY2x1ZGVfY29udGV4dF91dWlkDXF1ZXJ5QW5kRmV0Y2gBFjdGbDBNSjlHU20yZU0yRGt2aENPaFEAAAAAAAABGhZ5ZlFNcEZUMlQ4eUtKNmRGZDV2T053',
      scroll: '10m',
      rest_total_hits_as_int: true,
      // body: object
    })

    return result
}
exports.scrollEvents = scrollEvents