/*
* file name: queries.js
* use: to define Schemas of the Assets Management System Database.
* author: j-sparrow
* inital date: 2018-08-07
* version: 0.1
*/

import {mongoose, stringifyObjId, PORT, DB_NAME, cnn_url, options} from './config'
import {BasicInfo, User} from './schemas'

// connect to mongodb server
mongoose.connect(cnn_url, options,
    () => {console.log(`connection to ${DB_NAME} established`)},
    err => {console.error(`connection to ${DB_NAME} has failed. err: `, err)})

// a simple query
// User.findOne({name: 'Jack Sparrow'}, (err, user) => {
//     if (err) {
//         console.error(err)
//         return
//     }

//     console.info(user)
//     mongoose.disconnect()
// })


// use population --> so as to perform a "join" query
User.findOne({name: 'Jack Sparrow'}).
    populate('basicInfo').
    exec(function (err, user) {
        if (err) {
            console.err(err)
            return
        }

        console.info(user.basicInfo)
        mongoose.disconnect()
    })

