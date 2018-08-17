/*
* file name: schemas.js
* use: to define Schemas of the Assets Management System Database.
* author: j-sparrow
* inital date: 2018-08-08
* version: 0.1
*/

import { mongoose } from './config';

const { Schema } = mongoose;

// define schemas
const userSchema = new Schema({
  name: String,
  password: String,
  email: String,
  abandoned: Boolean,
  basicInfo: { type: Schema.Types.ObjectId, ref: 'BasicInfo' }, // reference to basic info
});

const basicInfoSchema = new Schema({
  gender: Boolean,
  city: String,
  profession: String,
  user: { type: Schema.Types.ObjectId, ref: 'User' }, // reference to basic user
});

const assetSchema = new Schema({
  name: String,
  location: String,
  type: String,
  worth: Number,
  description: String,
});

export const User = mongoose.model('User', userSchema);
export const BasicInfo = mongoose.model('BasicInfo', basicInfoSchema);
export const Asset = mongoose.model('Asset', assetSchema);
