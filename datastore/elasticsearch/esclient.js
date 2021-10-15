const { Client } = require('@elastic/elasticsearch')
const { config } = require('../../config/env')
const { logger } = require('../../logger')
const { eventIndexMapping } = require('../elasticsearch/eventIndexMapping')

const client = new Client({
  node: config.es_host,
  auth: {
    username: config.esUsername,
    password: config.esPassword
  }
})
const code = []
code.push("if(ctx._source.IAMessage.Detail.Info.FirstOccurrence == 'Unknown') {");
code.push("for(item in ctx.IAMessage.Detail.Info) {");
code.push("item.remove('FirstOccurrence');");
code.push("} ")
code.push("}")
source = code.join(" ");
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
    }, {
      "script": {
        "source": source
      }
  }
  ]
}

const addPipelineForCopyId = async function () {
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
  logger.debug("add pipeline result:", result)
}
const putEventIndexTimestampField = async () => {
  let result = ""
  try {
    result = await client.indices.putMapping({
      index: 'event*',
      body: {
        "properties": {
          "indexTimestamp": {
            "type": "date"
          }
        }
      }
    })
  } catch (error) {
    logger.error("putEventIndexTimestampField error:", error)
  }
  logger.info("putEventIndexTimestampField result:", result)
}




const putEventIndexMappingTemplate = async () => {
  let result = ""
  try {
    result = await client.indices.putTemplate({
      name: 'event_template',
      body: {
        "index_patterns": ["event*"],
        "mappings": eventIndexMapping
      }
    })
  } catch (error) {
    logger.error("putEventIndexMappingTemplate error:", error)
  }
  logger.info("putEventIndexMappingTemplate result:", result)
}


addPipelineForCopyId()
putEventIndexMappingTemplate()

exports.esClient = client
exports.addPipelineForCopyId = addPipelineForCopyId