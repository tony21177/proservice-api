// const cookieParser = require('cookie-parser')
const express = require("express");
const routes = require('./routes/index')
const path = require('path'); 
require('dotenv').config({ path: path.join(__dirname, '.env') });
const app = express();
app.use('/.well-known',express.static(__dirname + '/static/.well-known'));
// Certificate
const privateKey = fs.readFileSync('/etc/letsencrypt/live/apiproservice.ddns.net/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/apiproservice.ddns.net/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/apiproservice.ddns.net/chain.pem', 'utf8');
const credentials = {
	key: privateKey,
	cert: certificate,
	ca: ca
};

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



module.exports = app

