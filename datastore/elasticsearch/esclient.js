const { Client } = require('@elastic/elasticsearch')
const { config } = require('../../config/env')

console.log('username:',config.esUsername)
console.log('password:',config.esPassword)
const client = new Client({
  // node: 'https://opensearch-node1:9200',
  node: 'https://34.80.62.198:9200',
  auth: {
    username: config.esUsername,
    password: config.esPassword
  }
})




exports.esClient = client