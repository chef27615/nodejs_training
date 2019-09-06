// helper for var tasks

const crypto = require('crypto')
const config = require('./config')

// container for all helpers

const helpers = {}

// create a SHA256 hash
helpers.hash = str => {
    if(typeof(str) == 'string' && str.length > 0) {
        const hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex')
        return hash
    } else {
        return false
    }
}

// pase a json to an object in all cases w/o throwing

helpers.parseJsonToObject = str => {
    try{
        const obj = JSON.parse(str)
        return obj
    } catch(e) {
        return {}
    }
}



module.exports = helpers