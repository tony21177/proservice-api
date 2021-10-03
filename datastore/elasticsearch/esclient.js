const { Client } = require('@elastic/elasticsearch')
const { config } = require('../../config/env')

// console.log('username:',config.esUsername)
// console.log('password:',config.esPassword)
// console.log('node:',config.es_host)
const client = new Client({
  node: config.es_host,
  auth: {
    username: config.esUsername,
    password: config.esPassword
  }
})




exports.esClient = client