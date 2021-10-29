
const {dateHistogramOfEventCounts,dateHistogramOfField} = require('../../datastore/elasticsearch/commonUtil')


const testDateHistogram = async ()=>{
    const resultOfHistogram = await dateHistogramOfEventCounts('event*','2021-10-01','2021-10-30')
    console.log('resultOfHistogram:',resultOfHistogram)
    const buckets = resultOfHistogram.buckets
    const data = Object.keys(buckets).map((key) => {return {date:key,count:buckets[key].doc_count}});
    console.info(data)
}
testDateHistogram()


const testDateHistogramOfField = async ()=>{
    const result = await dateHistogramOfField("IAMessage.Detail.Info.Category","fieldAgg",'event*','2021-10-01','2021-10-30')
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
    console.log("data:",data)
}
testDateHistogramOfField()