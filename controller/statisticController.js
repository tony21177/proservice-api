const { async } = require("@firebase/util");
const { config } = require('../config/env')
const { DateTime } = require('luxon')
const elasticService = require('../datastore/elasticsearch/commonUtil');
const { logger } = require("../logger");



exports.fieldAggregationOfTimeRange = async (req, res, next) => {
    await validationReq(req,res,next)
    const ifFieldExist = await elasticService.ifFieldExist(req.body.field,config.eventIndex)
    if (!ifFieldExist) {
        res.status(400).json({
            success: false,
            data: null,
            msg: "field: " + req.body.field + " do not exist in event"
        })
        return
    }

    const result = await elasticService.fieldTermAggregateRange(req.body.field, "fieldAgg", config.eventIndex, req.body.from, req.body.to)
    const data = {}
    result.buckets.forEach(bucket => {
        logger.debug("bucket:",bucket)
        let catagory = bucket.key
        let count = bucket.doc_count
        data[catagory] = count
    })
    data.total = result.total
    res.status(200).json({
        success: true,
        data: data,
    })
    return
}

exports.dateHistogramOfCounts = async (req, res, next) => {
    await validationReq(req,res,next)
    const result = await elasticService.dateHistogramOfEventCounts(config.eventIndex,req.body.from,req.body.to)
    const buckets = result.buckets
    const data = Object.keys(buckets).map((key) => {return {date:key,count:buckets[key].doc_count}});
    data.total = result.total
    res.status(200).json({
        success: true,
        data: data,
        total: result.total
    })
}

exports.dateHistogramOfField = async (req, res, next) => {
    await validationReq(req,res,next)
    const ifFieldExist = await elasticService.ifFieldExist(req.body.field,config.eventIndex)
    if (!ifFieldExist) {
        res.status(400).json({
            success: false,
            data: null,
            msg: "field: " + req.body.field + " do not exist in event"
        })
        return
    }
    const result = await elasticService.dateHistogramOfField(req.body.field, "fieldAgg",config.eventIndex,req.body.from,req.body.to)
    const buckets = result.buckets
    const data = Object.keys(buckets).map((key) => {
        const aggBuckets = buckets[key].fieldAgg
        const categoryCount = {}
        aggBuckets.buckets.forEach(bucket => {
            let catagory = bucket.key
            let count = bucket.doc_count
            categoryCount[catagory] = count
        })

        return {date:key,categoryCount:categoryCount}
    });
    data.total = result.total
    console.log(data)
    res.status(200).json({
        success: true,
        data: data,
        total: result.total
    })
}


const validationReq = async (req, res, next) => {
    if (!req.body.from) {
        res.status(400).json({
            success: false,
            data: null,
            msg: "from is required"
        })
        return
    }
    if (!req.body.to) {
        res.status(400).json({
            success: false,
            data: null,
            msg: "to is required"
        })
        return
    }

    const fromDt = DateTime.fromFormat(req.body.from, "yyyy-MM-dd")
    const toDt = DateTime.fromFormat(req.body.to, "yyyy-MM-dd")

    if (fromDt.invalid != null) {
        res.status(400).json({
            success: false,
            data: null,
            msg: fromDt.invalid.explanation
        })
        return
    }
    if (toDt.invalid != null) {
        res.status(400).json({
            success: false,
            data: null,
            msg: toDt.invalid.explanation
        })
        return
    }
}