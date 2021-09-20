const path = require('path'); 


exports.config = {
    esUsername : process.env['opensearch_username'],
    esPassword : process.env['opensearch_password'],
    ca_path : process.env['ca_path']
}