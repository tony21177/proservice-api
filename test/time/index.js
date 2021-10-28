const { logger } = require('../../logger')
const dayjs = require('dayjs')
var utc = require('dayjs/plugin/utc')
var timezone = require('dayjs/plugin/timezone') // dependent on utc plugin


dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault("Asia/Taipei")
let todayTW = dayjs();
console.log("today in TW:",todayTW)
console.log("month:",todayTW.month()+1)
console.log("day:",todayTW.date())
