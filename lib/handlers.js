
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

// user put
// req: phone
// op data: first, last, password, at least one must be known
// @TODO only user can update, only can update their own object 

handle._users.put = (data, cb) => {
    // check for the req field
    const phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false
    
    // check for the op fields
    const firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false

    const lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false

    const password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false

    // err if the phone is invalid
    if(phone){
        // err if nothing send to update
        if(firstName || lastName || password){
            // look up user
            _data.read('users', phone, (err, data) => {
                if(!err && data){
                    // update the fields 
                    if(firstName){
                        data.firstName = firstName
                    }
                    if(lastName) {
                        data.lastName = lastName
                    } 
                    if(password) {
                        data.password = helpers.hash(password)
                    }
                    // store new update info
                    _data.update('users', phone, data, err => {
                        if(!err){
                            cb(200)
                        } else {
                            console.log(err)
                            cb(500, {'Error':'can not update the user'})
                        }
                    })
                } else {
                    cb(400, {'Error': 'No user found'})
                }
            })
        } else {
            cb(400, {'Error': 'missing update field'})
        }
    } else {
        cb(400, {'Error':'Missing required field'})
    }

}

// user delete
// req phone
// @TODO only auth user can delete their own obj
// @TODO cleanup any other data files associated with the user
handle._users.delete = (data, cb) => {
    // check the user is valid 
    const phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false
    if(phone) {
        // look up user
        _data.read('users', phone, (err, data) => {
            if(!err && data) {
                _data.delete('users', phone, err => {
                    if(!err) {
                        cb(200, {'message':'user deleted'})
                    } else {
                        cb(500, {'Error': 'can not delete user'})
                    }
                })
            } else {
                cb(400, {'error':'user not found'})
            }
        })
    } else {
        cb(400, {'error':'missing required field'})
    }
}


// token handle

handle.tokens = (data, cb) => {
    const acceptableMethods = ['post', 'put', 'get', 'delete']
    if (acceptableMethods.indexOf(data.method) > -1){
        handle._tokens[data.method](data, cb)
    } else {
        cb(405)
    }
}

// container for token methods
handle._tokens = {}

// Token CRUD
// token post
// req  phone, password
handle._tokens.post = (data, cb) => {
    const phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false
    const password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false
    if (phone && password){
        // look up user
        _data.read('users', phone, (err, data) => {
            if (!err && data){
                //hash the send password, and compare to the password in the obj
                const hashedPassword = helpers.hash(password)
                if(hashedPassword == data.password) {
                    // if valid create a new token
                    const tokenId =  helpers.createRandomString(20)

                    const exp = Date.now() + 1000 * 60 * 60

                    const tokenObj = {
                        'phone': phone,
                        'id': tokenId,
                        'expires': exp
                    }
                    
                    // store token
                    _data.create('tokens', tokenId, tokenObj, err => {
                        if(!err){
                            cb(200, tokenObj)
                        } else {
                            cb(500, {'Error':'can not create token'})
                        }
                    })

                } else {
                    cb(400, {'Error':'info did not match'})
                }
            } else {
                cb(400, {'error':'can not locate user'})
            }
        })
    } else {
        cb(400, {'Error': 'missing required field'})
    }
}

// token get

handle._tokens.get = (data, cb) => {
    
}

// token put

handle._tokens.put = (data, cb) => {
    
}

// token delete

handle._tokens.delete = (data, cb) => {
    
}

module.exports = handle