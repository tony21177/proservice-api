const { config } = require('../config/env')
const mqtt = require('mqtt')

const connectUrl = config.mqttUrl
console.log("mqtt url:",connectUrl)
const mqttOption =  {
    // clientId: config.mqttClientId,
    clean: true,
    connectTimeout: 4000,
    username: config.mqttUsername,
    password: config.mqttPassword,
    reconnectPeriod: 1000,
}

console.log("mqttOption:",mqttOption)
const client = mqtt.connect(connectUrl,mqttOption)
const topic = 'event/server/newest'
client.on('connect', () => {
    console.log('mqtt Connected.........................')
})

const publishNewestEvent = async eventId => {
    console.log("publishNewestEvent....")
    let mqttMsg = {lastId:eventId}

    client.publish(topic,JSON.stringify(mqttMsg), { qos: 1, retain: true }, (error,packet) => {
        console.log('packet:',packet)
        if (error) {
            console.log("error:", error)
            console.error("publish error for event id:", eventId)
        }
    })
}
exports.publishNewestEvent = publishNewestEvent;