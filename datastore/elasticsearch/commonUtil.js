const { esClient } = require('./esclient')
const util = require('util');
const { config } = require('../../config/env');
const { logger } = require('../../logger');
const { async } = require('@firebase/util');




exports.ifFieldExist = async (field, index) => {

  const body = {
    "query": {
      "exists": {
        "field": field
      }
    },
    "size": 0
  }
  const result = await esClient.search({
    index: index,
    body: body
  })
  if (result && result.body.hits && result.body.hits.total && result.body.hits.total.value > 0) return true
  return false
}

exports.fieldTermAggregateRange = async (field, termQueryName, index, from, to) => {
  const result = await esClient.search({
    index: index,
    body: {
      "size": 0,
      "query": {
        "range": {
          "IAMessage.Detail.Info.TimeOfEvent": {
            "gte": from,
            "lte": to,
            "format": "yyyy-MM-dd",
            "time_zone": "Asia/Taipei"
          }
        }
      },
      "aggs": {
        [termQueryName]: {
          "terms": {
            "field": field + ".keyword"
          }
        }
      }
    }
  })
  logger.debug(result.body.aggregations)

  return {
    buckets: result.body.aggregations[termQueryName].buckets,
    total: result.body.hits.total.value
  }
}

exports.dateHistogramOfEventCounts = async (index, from, to) => {
  const result = await esClient.search({
    index: index,
    body: {
      "size": 0,
      "query": {
        "range": {
          "IAMessage.Detail.Info.TimeOfEvent": {
            "gte": from,
            "lte": to,
            "format": "yyyy-MM-dd",
            "time_zone": "Asia/Taipei"
          }
        }
      },
      "aggs": {
        "counts_over_time": {
          "date_histogram": {
            "field": "IAMessage.Detail.Info.TimeOfEvent",
            "calendar_interval": "day",
            "format": "yyyy-MM-dd",
            "time_zone": "Asia/Taipei",
            "keyed": true,
            "min_doc_count": 0,
            "extended_bounds": {
              "min": new Date(from).getTime(),
              "max": new Date(to).getTime()
            }
          }
        }
      }
    }
  })
  // logger.debug(result.body.aggregations)
  return {
    buckets: result.body.aggregations.counts_over_time.buckets,
    total: result.body.hits.total.value
  }
}

exports.dateHistogramOfField = async (field, termQueryName, index, from, to) => {
  const result = await esClient.search({
    index: index,
    body: {
      "size": 0,
      "query": {
        "range": {
          "IAMessage.Detail.Info.TimeOfEvent": {
            "gte": from,
            "lte": to,
            "format": "yyyy-MM-dd",
            "time_zone": "Asia/Taipei"
          }
        }
      },
      "aggs": {
        "counts_over_time": {
          "date_histogram": {
            "field": "IAMessage.Detail.Info.TimeOfEvent",
            "calendar_interval": "day",
            "format": "yyyy-MM-dd",
            "time_zone": "Asia/Taipei",
            "keyed": true,
            "min_doc_count": 0,
            "extended_bounds": {
              "min": new Date(from).getTime(),
              "max": new Date(to).getTime()
            }
          },
          "aggs": {
            [termQueryName]: {
              "terms": {
                "field": field + ".keyword"
              }
            }
          }
        }
      }
    }
  })
  // logger.debug(result.body.aggregations)
  return {
    buckets: result.body.aggregations.counts_over_time.buckets,
    total: result.body.hits.total.value
  }
}