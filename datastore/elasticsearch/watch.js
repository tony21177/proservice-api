const { esClient } = require('./esclient')
const { config } = require('../../config/env');
const { logger } = require('../../logger')

const dayjs = require('dayjs')
var utc = require('dayjs/plugin/utc')
var timezone = require('dayjs/plugin/timezone') // dependent on utc plugin
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault("Asia/Taipei")

exports.monitoringForNoDataLastingMinutes = async (minutes) => {
    const index = 'event*'
    const trigger = {
        "schedule": {
            "interval": "30m"
        }
    }
    const input = {
        "request": {
            "indices": [index],
            "body": {
                "query": {
                    "bool": {
                        "filter": [
                            {
                                "range": {
                                    "IAMessage.Header.@TimeStamp": {
                                        "gte": "now-30m"
                                    }
                                }
                            }
                        ]
                    }
                }
            }
        }
    }
    const compare = { "ctx.payload.hits.total" : { "lte" : 0 }}
    let todayTW = dayjs();
    const actions = {
        "no_event_monitor":{
            "index":{
                "index": "no-event-monitor-"+ (todayTW.month() + 1),
                "execution_time_field": "alertTime"
            }
        }
    }
    const watchBody = {
        "trigger":trigger,
        "inpue":input,
        "condition":{"compare":compare},
        actions:actions
    }

    let result = ""
    try{
        result = await esClient.watcher.putWatch({
            id:"monitor_event",
            active:true,
            body:watchBody
        })
    }catch(error){
        logger.error("monitoringForNoDataLastingMinutes error:",error)
    }
    logger.info("add monitor_event result:",result)
}