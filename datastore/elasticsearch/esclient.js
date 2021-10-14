const { Client } = require('@elastic/elasticsearch')
const { config } = require('../../config/env')
const {logger} = require('../../logger')
const client = new Client({
  node: config.es_host,
  auth: {
    username: config.esUsername,
    password: config.esPassword
  }
})
// add pipeline
const pipelineContent = {
  "description": "copy _id to eventId for search after",
  "processors": [
    {
      "set": {
        "description": "copy _id to eventId for search after",
        "field": "eventId",
        "value": "{{_id}}"
      }
    }
  ]
}

const addPipelineForCopyId =  async function (){
let result = ""
try {
  result = await client.ingest.putPipeline({
    id: "copy_id_to_eventId",
    // master_timeout: string,
    // timeout: string,
    body: pipelineContent
  })
} catch (error) {
  logger.error("addPipelineForCopyId error:", error)
}
logger.debug("add pipeline result:",result)
}

addPipelineForCopyId()

exports.esClient = client
exports.addPipelineForCopyId = addPipelineForCopyId