const path = require('path'); 

exports.config = {
    esUsername : process.env['opensearch_username'],
    esPassword : process.env['opensearch_password'],
    ca_path : process.env['ca_path'],
    es_host: process.env['es_host'],
    mqttUrl: process.env['mqtt_url'],
    mqttClientId: process.env['clientId'],
    mqttUsername: process.env['mqtt_username'],
    mqttPassword: process.env['mqtt_password']
}