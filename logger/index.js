// const bunyan = require('bunyan');


// if (process.env.NODE_ENV == "develope") {
  exports.logger = console
// }else{
// // Imports the Google Cloud client library for Bunyan
// const {LoggingBunyan} = require('@google-cloud/logging-bunyan');

// // Creates a Bunyan Cloud Logging client
// const loggingBunyan = new LoggingBunyan();

// // Create a Bunyan logger that streams to Cloud Logging
// // Logs will be written to: "projects/YOUR_PROJECT_ID/logs/bunyan_log"
// exports.logger = bunyan.createLogger({
//   // The JSON payload of the log as it appears in Cloud Logging
//   // will contain "name": "my-service"
//   name: 'proservice-api-server',
//   streams: [
//     // Log to the console at 'info' and above
//     {stream: process.stdout, level: 'info'},
//     // And log to Cloud Logging, logging at 'info' and above
//     loggingBunyan.stream('info'),
//   ],
// });

// }