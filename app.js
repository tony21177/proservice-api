// const cookieParser = require('cookie-parser')
const express = require("express");
const routes = require('./routes/index')
const path = require('path'); 
require('dotenv').config({ path: path.join(__dirname, '.env') });
const app = express();


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


module.exports = app

