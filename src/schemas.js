/*
* file name: schemas.js
* use: to define Schemas of the Assets Management System Database.
* author: j-sparrow
* inital date: 2018-08-08
* version: 0.1
*/

import {mongoose} from './config'

const {Schema} = mongoose

// define schemas
const userSchema = new Schema({
    name: String,
    password: String,
    login: Boolean,
    abandoned: Boolean,
    basicInfo: {type: Schema.Types.ObjectId, ref: 'BasicInfo'} // reference to basic info
})

const basicInfoSchema = new Schema({
    gender: Boolean,
    address: String,
    profession: String,
    user: {type: Schema.Types.ObjectId, ref: 'User'} // reference to basic user
})

export const User = mongoose.model('User', userSchema)
export const BasicInfo = mongoose.model('BasicInfo', basicInfoSchema)
