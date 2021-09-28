const { esClient } = require('./esclient')
const util = require('util');
const { config } = require('../../config/env')

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

const insertRawEventLog = async (month,day,data) =>{
  const response = await esClient.index({
      index: "raw_xml_"+"event_"+month+"_"+day,
      op_type: 'create',
      refresh: 'true' ,
      body: data
    })
  return response  
}
exports.insertEventLog = insertRawEventLog

const scrollEvents = async (from,size,scrollId) => {
    // first 
    let result = getEmptyResult();
    if(!scrollId||scrollId.trim()==''){
      if(!Number.isInteger(size)){
        size = 10;
      }  
      if(!Number.isInteger(from)){
        from = 0;
      } 
      result = await esClient.search({
        index: 'event*',
        sort: ['IAMessage.Detail.Info.TimeOfEvent:desc'],
        from: from,
        size: size,
        scroll:'10m',
      }, {
        ignore: [404],
        maxRetries: 2
      })
      if(result.body.hits.hits.length==0){
        result = getEmptyResult();
        return result;
      }
      result=result = parseEsResult(result)
    }else{
      // next
      if(scrollId=='0'){
        return {scrollId:'0',events:[],total:0}
      }
      result = await esClient.scroll({
        scroll_id: scrollId,
        scroll: '10m',
        rest_total_hits_as_int: true,
      })
      if(result.body.hits.hits.length==0){
        clearScroll(scrollId)
        result = getEmptyResult();
        return result;
      }
      result = parseEsResult(result)
    }
    return result
}
exports.scrollEvents = scrollEvents

const parseEsResult = result=>{
    const scrollId = result.body['_scroll_id']
    const total = result.body.hits.total.value
    const events = result.body.hits.hits.map(data=>data['_source'])
    return {total:total,scrollId:scrollId,events:events}
}

const getEmptyResult = ()=>{
    return {scrollId:'0',events:[]}
}

const clearScroll = async(scrollId)=>{
  const axios = require('axios')

  axios.delete(config.es_host+'/_search/scroll', {
      data: {"scroll_id" : [scrollId]},
      auth: {
          username: config.esUsername,
          password: config.esPassword
      }
    })
  .then(res => {
      console.log(`statusCode: ${res.status}`)
  })
  .catch(error => {
      console.error(error)
  })
}