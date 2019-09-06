
// Dependencies
const _data = require('./data')
const helpers = require('./helpers')


// define handlers
handle = {}

// handle.sample = (data, cb) => {
//     // callback a http status code and a payload object
//     cb(406, {'name':'sample handler'})
// }

handle.ping = (data, cb) => {
    cb(200)
}

// not found handler
handle.notFound = (data, cb) => {
    cb(404)
}

// handle users
handle.users = (data, cb) => {
    const acceptableMethods = ['post', 'get', 'put', 'delete']
    if(acceptableMethods.indexOf(data.method) > -1){
        handle._users[data.method](data, cb)
    } else {
        cb(405)
    }
}

// container for the user methods

handle._users = {}

// users post
// req: fist, last, phone, password, tosAgreement, 
handle._users.post = (data, cb) => {
    // check all required fields all filled out
    const firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false

    const lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false

    const phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false
    
    const password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false

    const tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false

    if(firstName && lastName && phone && password && tosAgreement) {
        // make sure the user does not already exist
        _data.read('users', phone, (err, data) => {
            if(err) {
                // hash the password
                const hashedPassword = helpers.hash(password)

                // create the user object
                if (hashedPassword) {
                    const userObj = {
                        'firstName': firstName,
                        'lastName': lastName,
                        'phone': phone,
                        'password': hashedPassword,
                        'tosAgreement' : true
                    }
    
                    // store the user
    
                    _data.create('users', phone, userObj, err => {
                        if(!err){
                            cb(200)
                        } else {
                            console.log(err)
                            cb(500, {'error':'could not create the new user'})
                        }
                    })

                } else {
                    cb(500, {'error': 'could not hash users password'})
                }

            } else {
                cb(400, {'error': 'user with that number is already exist'})
            }
        })
    } else {
        cb(400, {'error':'missing required fields'})
    }

    // console.log(firstName. lastName, phone, password, tosAgreement)
}

// user get
// req: phone
// @TODO only let an auth user to access their own object
handle._users.get = (data, cb) => {
    // check the phone number is valid
    const phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false
    if(phone) {
        // look up user
        _data.read('users', phone, (err, data) => {
            if(!err && data) {
                // remove the hash password from the user object before return info
                delete data.password
                cb(200, data)
            } else {
                cb(404, {'error':'user not found'})
            }
        })
    } else {
        cb(400, {'error':'missing required field'})
    }
}

//user put
handle._users.put = (data, cb) => {

}

// user delete
handle._users.delete = (data, cb) => {

}



module.exports = handle