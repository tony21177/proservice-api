const { config } = require('../config/env')
const mqtt = require('mqtt')
const {logger} = require('../logger')
const connectUrl = config.mqttUrl
const mqttOption =  {
    // clientId: config.mqttClientId,
    clean: true,
    connectTimeout: 4000,
    username: config.mqttUsername,
    password: config.mqttPassword,
    reconnectPeriod: 1000,
}

const client = mqtt.connect(connectUrl,mqttOption)
const topic = 'event/server/newest'
client.on('connect', () => {
    logger.info('mqtt Connected.........................')
})

const publishNewestEvent = async (eventId,indexTimestamp) => {
    let mqttMsg = {lastId:eventId,indexTimestamp:indexTimestamp}

    client.publish(topic,JSON.stringify(mqttMsg), { qos: 1, retain: true }, (error,packet) => {
        if (error) {
            logger.error("error:", error)
            logger.error("publish error for event id:", eventId)
        }
    })
}
exports.publishNewestEvent = publishNewestEvent;