const { Client } = require('@elastic/elasticsearch')
const { config } = require('../../config/env')

const client = new Client({
  node: 'https://opensearch-node1:9200',
  auth: {
    username: config.esUsername,
    password: config.esPassword
  }
})


exports.esClient = client