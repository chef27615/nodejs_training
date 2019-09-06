// for store data 

const fs = require('fs')
const path = require('path')
const helpers = require('./helpers')

// container for the module
const lib = {}

// base dir of data folder

lib.baseDir = path.join(__dirname, '/../.data/')

// write data to a file
lib.create = function(dir, file, data, cb){
    // open file for writing
    fs.open(lib.baseDir+dir+'/'+file+'.json','wx', (err, fileDes) => {
        if(!err && fileDes){
            // convert data to string
            const stringData = JSON.stringify(data)

            // write file and close it
            fs.writeFile(fileDes,stringData, err => {
                if(!err) {
                    fs.close(fileDes, err => {
                        if(!err){
                            cb(false)
                        } else{
                            cb('Error closing new file')
                        }
                    })
                } else{
                    cb('Error writing new file')
                }
            })
        } else {
            cb('Could not create new file, it maybe already exist')
        }
    })
}

// read data from file

lib.read  = (dir, file, cb) => {
    fs.readFile(lib.baseDir+dir+'/'+file+'.json', 'utf-8', (err, data) => {
        if(!err && data) {
            const parsedData = helpers.parseJsonToObject(data)
            cb(false, parsedData)
        } else {
            cb(err, data)
        }
    })
}

// update data inside a file

lib.update = (dir, file, data, cb) => {
    // open the file for writing
    fs.open(lib.baseDir+dir+'/'+file+'.json', 'r+', (err, fileDes) => {
        if(!err && fileDes){
            // convert a data to string
            const stringData = JSON.stringify(data)

            // truncate the file
            fs.ftruncate(fileDes, err => {
                if(!err){
                    // write to the file and close it
                    fs.writeFile(fileDes, stringData, err=> {
                        if (!err) {
                            fs.close(fileDes, err => {
                                if(!err){
                                    cb(false)
                                } else {
                                    cb('Error closing the file')
                                }
                            })
                        } else {
                            cb('Error writing to existing file')
                        }
                    })

                } else {
                    cb('Error truncating file')
                }
            })
        } else {
            cb('Could not open the file, it may not exist')
        }
    })
}


// Delete file

lib.delete = (dir, file, cb) => {
    // unlinking

    fs.unlink(lib.baseDir+dir+'/'+file+'.json', err=> {
        if (!err){
            cb(false)
        } else {
            cb('Error deleting the file')
        }
    })
}

module.exports = lib