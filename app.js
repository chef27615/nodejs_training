// nodejs build in dependency
const http = require('http')
const https = require('https')
const url = require('url')
const StringDecoder = require('string_decoder').StringDecoder

const fs = require('fs')
const config = require('./lib/config')
const handle = require('./lib/handlers')
const helpers = require('./lib/helpers')



// const _data = require('./lib/data')
// // Testing
// // @TODO: delete this
// _data.delete('test','newFile', err => {
//     console.log('this is err ', err)
// })




// init HTTP server
const httpServer = http.createServer((req, res) => {
    unifiedServer(req, res)
})

httpServer.listen(config.httpPort, () => {
    console.log(`port: ${config.httpPort}`)
})

// init HTTPS server
const httpsServerOptions = {
    'key': fs.readFileSync('./https/key.pem'),
    'cert': fs.readFileSync('./https/cert.pem')
}

const httpsServer = https.createServer(httpsServerOptions, (req, res) => {
    unifiedServer(req, res)
})

httpsServer.listen(config.httpsPort, () => {
    console.log(`port: ${config.httpsPort}`)
})


// unified server to handle logic for http and https ports

const unifiedServer = (req, res) => {
    // get the url and parse it
    const parsedUrl = url.parse(req.url, true); 

    // get a path
    const path = parsedUrl.pathname
    // once get the path, then need to trim extra stuff inside the path, regex is friend. 
    const trimPath = path.replace(/^\/+|\/+$/g,'') 

    // get query string as an object
    const queryStringObject = parsedUrl.query
    
    // get http method
    const method = req.method.toLowerCase()

    // get headers
    const headers = req.headers

    // get payload
    const decoder = new StringDecoder('utf-8')
    // empty place holder for the incoming string
    // make sure the variable is not a 'const', else it will raise error
    let buffer = ''
    req.on('data', data => {
        buffer += decoder.write(data)
    })
    req.on('end', () => {
        buffer += decoder.end()

        // choose the handler req should go to
        const chosenHandler = typeof(router[trimPath]) !== 'undefined' ? router[trimPath] : handle.notFound

        // construct data obj to send to handler
        const data = {
            'trimPath': trimPath, 
            'queryStringObject': queryStringObject,
            'method' : method,
            'headers' : headers,
            'payload' : helpers.parseJsonToObject(buffer)
        }

        // Router the req to router
        chosenHandler(data, (statusCode, payload) => {
            // use status code cb by the handler
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200
            // use payload
            payload = typeof(payload) == 'object' ? payload : {}

            // convert the payload to string
            const payloadString = JSON.stringify(payload)

            // return response
            res.setHeader('Content-Type', 'application/json') // send back json 
            res.writeHead(statusCode)
            res.end(payloadString)

            // log the path
            console.log('response: ', statusCode, payloadString)
        })  
    })
}

// define router
const router = {
    'ping': handle.ping,
    'users': handle.users,
    'tokens': handle.tokens
}
