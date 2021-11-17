const { Client } = require('@elastic/elasticsearch')
const { config } = require('../../config/env')
const { logger } = require('../../logger')
const { eventIndexMapping } = require('../elasticsearch/eventIndexMapping')
const {notEventIndexMapping} = require('../elasticsearch/notEventIndexMapping')

const client = new Client({
  node: config.es_host,
  auth: {
    username: config.esUsername,
    password: config.esPassword
  }
})
const code = []
code.push("if(ctx.Detail.Info.FirstOccurrence == 'Unknown') {");
code.push("for(item in ctx.Detail.Info) {");
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
      "remove": {
        "description": "Drop FirstOccurrence when Unknown",
        "field": "Detail.Info.FirstOccurrence",
        "if": "ctx?.Detail?.Info?.FirstOccurrence == 'Unknown'"
      }
    }, {
      "remove": {
        "description": "Drop FirstOccurrence when Unknown",
        "field": "IAMessage.Detail.Info.FirstOccurrence",
        "if": "ctx?.IAMessage?.Detail?.Info?.FirstOccurrence == 'Unknown'"
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
  logger.info("add pipeline result:", result)
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

const putNotEventIndexMappingTemplate = async () => {
  let result = ""
  try {
    result = await client.indices.putTemplate({
      name: 'not_event_template',
      body: {
        "index_patterns": ["not_event*"],
        "mappings": notEventIndexMapping
      }
    })
  } catch (error) {
    logger.error("putNotEventIndexMappingTemplate error:", error)
  }
  logger.info("putNotEventIndexMappingTemplate result:", result)
}

if(process.env.NODE_ENV != "develope"){
  addPipelineForCopyId()
  putEventIndexMappingTemplate()
  putNotEventIndexMappingTemplate()
}

exports.esClient = client
exports.addPipelineForCopyId = addPipelineForCopyId