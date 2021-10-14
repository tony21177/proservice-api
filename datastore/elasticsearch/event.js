const { esClient } = require('./esclient')
const util = require('util');
const { config } = require('../../config/env');
const { v4: uuidv4 } = require('uuid');
const {logger} = require('../../logger')


const insertEventLog = async (month, day, data,indexTimestamp) => {
  data.indexTimestamp = indexTimestamp;
  const response = await esClient.index({
    id:uuidv4(),
    index: "event_" + month + "_" + day,
    op_type: 'create',
    refresh: 'true',
    body: data,
    pipeline: "copy_id_to_eventId"
  })
  return response
}
exports.insertEventLog = insertEventLog

const insertRawEventLog = async (month, day, data) => {
  const response = await esClient.index({
    index: "raw_xml_" + "event_" + month + "_" + day,
    op_type: 'create',
    refresh: 'true',
    body: data,
    pipeline: "copy_id_to_eventId"
  })
  return response
}
exports.insertRawEventLog = insertRawEventLog

const syncEvents = async(size,lastId,indexTimestamp) =>{
  let result = getEmptyResult();
  if(!lastId || !indexTimestamp || isNaN(indexTimestamp)){
    throw new Error("lastId and indexTimestamp is required");
  }
  if (!Number.isInteger(size)) {
    size = 10;
  }
  let searchBody = {
    index: 'event*',
    sort: ['indexTimestamp:asc','eventId.keyword:asc'],
    size: size,
    body:{search_after:[indexTimestamp,lastId]}
  }
  result = await esClient.search(searchBody, {
    ignore: [404],
    maxRetries: 2
  })
  if (result.body.hits.hits.length == 0) {
    result = getEmptyResult();
    return result;
  }
  result = parseEsResult(result)
  return result
}

exports.syncEvents = syncEvents


const scrollEvents = async (from, size, scrollId) => {
  // first 
  let result = getEmptyResult();
  if (typeof scrollId == 'undefined'||!scrollId || scrollId.trim() == '') {
    if (!Number.isInteger(size)) {
      size = 10;
    }
    if (!Number.isInteger(from)) {
      from = 0;
    }
    let searchBody = {
      index: 'event*',
      sort: ['indexTimestamp:desc','eventId.keyword:desc'],
      from: from,
      size: size,
      scroll: '10m',
    }

    result = await esClient.search(searchBody, {
      ignore: [404],
      maxRetries: 2
    })
    if (result.body.hits.hits.length == 0) {
      result = getEmptyResult();
      return result;
    }
    result = parseEsResult(result)
  } else {
    // next
    if (scrollId == '0') {
      return { scrollId: '0', events: [], total: 0 }
    }
    result = await esClient.scroll({
      scroll_id: scrollId,
      scroll: '10m',
      rest_total_hits_as_int: true,
    })
    if (result.body.hits.hits.length == 0) {
      clearScroll(scrollId)
      result = getEmptyResult();
      return result;
    }
    result = parseEsResult(result)
  }
  return result
}
exports.scrollEvents = scrollEvents


const parseEsResult = result => {
  const scrollId = result.body['_scroll_id']
  const total = result.body.hits.total.value
  const events = result.body.hits.hits.map(data => {
    data['_source'].eventId = data['_id']
    return data['_source']
  })
  parseForVerbose(events)
  transformDateTime(events)
  return { total: total, scrollId: scrollId, events: events }
}

const getEmptyResult = () => {
  return { scrollId: '0', events: [] }
}

const clearScroll = async (scrollId) => {
  const axios = require('axios')

  axios.delete(config.es_host + '/_search/scroll', {
    data: { "scroll_id": [scrollId] },
    auth: {
      username: config.esUsername,
      password: config.esPassword
    }
  })
    .then(res => {
      logger.debug(`statusCode: ${res.status}`)
    })
    .catch(error => {
      logger.error("delete scroll error:",error)
    })
}

const parseForVerbose = events => {
  events.forEach(event => {
    const Terse = event['IAMessage']['Detail']['Info']['Terse']
    if (Terse == 'RV Supply is low' || Terse == 'Aspiration Monitor detected possible obstruction' || Terse == 'Run completed') {
      parseVerboseForAllLine(event)
    } else {
      parseVerboseExcludeFirstLine(event)
    }
  })
}

const parseVerboseForAllLine = event => {

  const verbose = event['IAMessage']['Detail']['Info']['Verbose']
  if (!verbose) {
    return
  }
  const parsedArray = verbose.split('\n')
  const parsedVerbose = {};
  parseVerboseKeyValue(parsedArray,parsedVerbose)
  event['IAMessage']['Detail']['Info']['verboseDescription'] = event['IAMessage']['Detail']['Info']['Terse']
  event['IAMessage']['Detail']['Info']['parsedVerbose'] = parsedVerbose

}

const parseVerboseExcludeFirstLine = event => {
  const verbose = event['IAMessage']['Detail']['Info']['Verbose']
  if (!verbose) {
    return
  }
  const description = verbose.split(/\n(.+)/s)[0]
  event['IAMessage']['Detail']['Info']['verboseDescription'] = description
  const body = verbose.split(/\n(.+)/s)[1]
  if (body) {
    const parsedArray = body.split('\n')
    const parsedVerbose = {};
    parseVerboseKeyValue(parsedArray,parsedVerbose)
    event['IAMessage']['Detail']['Info']['parsedVerbose'] = parsedVerbose
  } else {
    event['IAMessage']['Detail']['Info']['parsedVerbose'] = ''
  }
}

const parseVerboseKeyValue = (rawKeyValueArray,parsedVerbose) =>{
  let key;
  let value;
  rawKeyValueArray.forEach(pair => {
    if(pair.includes("Backup")){
      //key = pair.split(/on(.+)/s)[0]
      //value = pair.split(/on(.+)/s)[1]
      key = pair.split(" ")
      key = pair.split(" ")[0]+pair.split(" ")[1]+pair.split(" ")[2]
      value = pair.split(" ")[3]+" "+pair.split(" ")[4]+" "+pair.split(" ")[5]
    }else{
      key = pair.split(/:(.+)/s)[0]
      key = key.replace(/ /g, '')
      value = pair.split(/:(.+)/s)[1]
    }

    
    
    if(pair||pair.trim()!=""){
      if(value){
        value = value.replace(/\t/g, '');
        if(!key.includes("Device")&&!key.includes("DeviceError")&&!key.includes("EventTime")&&!key.includes("FileRevision")&&!key.includes("Backup")){
          value = value.replace(/ /g, '')
        }
      }
      if(value=="{NULL}") value=""
      parsedVerbose[key] = value
    }          
  })
}

const transformDateTime = events => {
  events.forEach(event => {
    if (event.IAMessage.Detail.Info.FirstOccurrence && event.IAMessage.Detail.Info.FirstOccurrence.trim() != "") {
      const datetime = new Date(event.IAMessage.Detail.Info.FirstOccurrence);
      event.IAMessage.Detail.Info.FirstOccurrence = datetime.getTime();
    }
    if (event.IAMessage.Detail.Info.TimeOfEvent && event.IAMessage.Detail.Info.TimeOfEvent.trim() != "") {
      const datetime = new Date(event.IAMessage.Detail.Info.TimeOfEvent);
      event.IAMessage.Detail.Info.TimeOfEvent = datetime.getTime();
    }
    if (event.IAMessage.Header['@TimeStamp'] && event.IAMessage.Header['@TimeStamp'].trim() != ""){
      const datetime = new Date(event.IAMessage.Header['@TimeStamp']);
      event.IAMessage.Header['@TimeStamp'] = datetime.getTime();
    }
    if (event.Timestamp && event.Timestamp.trim() != ""){
      const datetime = new Date(event.Timestamp);
      event.Timestamp = datetime.getTime();
    }

  })
}