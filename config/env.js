const path = require('path'); 
require('dotenv').config({ path: path.join(__dirname, '.env') });
console.log(process.env['GOOGLE_APPLICATION_CREDENTIALS']);


exports.config = {
    esUsername = process.env['username'],
    esPassword = process.env['password']
}