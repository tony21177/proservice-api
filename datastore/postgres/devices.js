const db = require('./index')
const {logger} = require('../../logger')

exports.getPublicKeyByMac = async (mac) => {
    let result="";
    try {
        result = await db.query('select * from devices where mac = $1',[mac])
        if(result.rowCount==0){
            throw new Error("the device is not valid")
        }
    } catch (e) {
        logger.error("getPublicKeyByMac error:", e.message);
        throw e;
    }

    return result
}

exports.insertOrUpdateDeviceByMac = async (loc,ip,hostname,mac) => {
    let result="";
    try {
        result = await db.query('insert into devices(location,ip,hostname,mac) values($1,$2,$3,$4) ON CONFLICT (mac) DO UPDATE SET location=$1,ip=$2,hostname=$3,"updatedAt"=now()',[loc,ip,hostname,mac])
        
    } catch (e) {
        logger.error("insertOrUpdateDeviceByMac error:", e.message);
        throw e;
    }

    return result
}
