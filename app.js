// const cookieParser = require('cookie-parser')
const express = require("express");
const routes = require('./routes/index')
const path = require('path'); 
require('dotenv').config({ path: path.join(__dirname, '.env') });
const app = express();
app.use('/.well-known',express.static(__dirname + '/static/.well-known'));
// const {logger} = require('./logger')


const cors = require('cors')
app.use(cors())

app.use(express.json())
app.use(express.raw({
  type:"text/plain",
  verify: (req, res, buf, encoding) => {
    req.rawBody = buf
  }
}))
  
app.use(express.urlencoded({ extended: true }))
// app.use(cookieParser())
app.use('/', routes);

console.log("server time zone:",process.env.TZ)

module.exports = app

