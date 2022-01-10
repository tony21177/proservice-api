console.log("process.env....")
console.log(process.env)
exports.config = {
    esUsername : process.env['opensearch_username'],
    esPassword : process.env['opensearch_password'],
    ca_path : process.env['ca_path'],
    es_host: process.env['es_host'],
    mqttUrl: process.env['mqtt_url'],
    mqttClientId: process.env['clientId'],
    mqttUsername: process.env['mqtt_username'],
    mqttPassword: process.env['mqtt_password'],
    tokenEnv:process.env['TOKEN_ENV'],
    eventIndex:process.env['EVENT_INDEX'],
    enableFcmNotify:process.env['ENABLE_FCM_NOTIFY']
}