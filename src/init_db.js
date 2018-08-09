/*
* file name: init_db.js
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


let basicInfo = new BasicInfo({
    gender: true,
    address: 'Jia Xing',
    profession: 'CFA'})

// user depends on basic info, so save basic info first
basicInfo.save((err, basicInfo) => {
    if (err) {
        console.error(err)
        return
    }

    let user = new User({
        _id: new mongoose.Types.ObjectId(),
        name: 'Jack Sparrow',
        password: 'black pearl',
        abandoned: false,
        basicInfo: basicInfo._id})

    user.save((err, user) => {
        if (err) {
            console.error(err)
            return
        }
        mongoose.disconnect()
    })
})


