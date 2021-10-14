
const { async } = require('@firebase/util');
const { firebaseAdmin } = require('../firebase')
const {logger} = require('../logger')

const topic = '/topics/latestEvent';

exports.publicLatestEvent = async (lastEventId, indexTimestamp) => {
    const message = {
        data: {
            lastId: lastEventId,
            indexTimestamp: indexTimestamp.toString()
        },
        topic: topic
    };
    // Send a message to devices subscribed to the provided topic.
    firebaseAdmin.messaging().send(message)
        .then((response) => {
            // Response is a message ID string.
            const splitMsgArray = response.split('/');
            const msgId = splitMsgArray[splitMsgArray.length - 1]
            logger.debug("msgId:", msgId);
        })
        .catch((error) => {
            logger.error('Error sending message:', error);
        });
}

exports.publicLatestEventToDevices = async (lastEventId, indexTimestamp, deviceFcmTokenArray) => {
    const message = {
        data: {
            lastId: lastEventId,
            indexTimestamp: indexTimestamp.toString()
        },
        tokens: deviceFcmTokenArray
    };
    firebaseAdmin.messaging().sendMulticast(message)
        .then((response) => {
            // Response is a message ID string.
            logger.debug("successCount:%d,failureCount:%d",response.successCount,response.failureCount)
            response.responses.forEach(element => {
                logger.debug("success:%s,error:%s",element.success,element.error)
            });
        })
        .catch((error) => {
            logger.error('Error sending message:', error);
        });
}



