
const { async } = require('@firebase/util');
const { firebaseAdmin } = require('../firebase')


const topic = '/topics/latestEvent';

exports.publicLatestEvent = async (lastEventId, indexTimestamp) => {
    const message = {
        data: {
            lastId: lastEventId,
            indexTimestamp: indexTimestamp.toString()
        },
        topic: topic
    };
    console.log('message', message)
    // Send a message to devices subscribed to the provided topic.
    firebaseAdmin.messaging().send(message)
        .then((response) => {
            // Response is a message ID string.
            console.log('Successfully sent message:', response);
            const splitMsgArray = response.split('/');
            const msgId = splitMsgArray[splitMsgArray.length - 1]
            console.log("msgId:", msgId);
        })
        .catch((error) => {
            console.log('Error sending message:', error);
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
            console.log("successCount:%d,failureCount:%d",response.successCount,response.failureCount)
            response.responses.forEach(element => {
                console.log("success:%s,error:%s",element.success,element.error)
            });
        })
        .catch((error) => {
            console.log('Error sending message:', error);
        });
}



