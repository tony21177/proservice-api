const { Client } = require('@elastic/elasticsearch')
const { config } = require('../../config/env')

console.log('username:',config.esUsername)
console.log('password:',config.esPassword)
console.log('node:',config.esHost)
const client = new Client({
  node: config.esHost,
  auth: {
    username: config.esUsername,
    password: config.esPassword
  }
})




exports.esClient = client