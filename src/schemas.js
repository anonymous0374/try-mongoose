/*
* file name: schemas.js
* use: to define Schemas of the Assets Management System Database.
* author: j-sparrow
* inital date: 2018-08-08
* version: 0.1
*/

import bcrypt from 'bcrypt';
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

userSchema.pre('save', function (next) {
  const user = this;
  bcrypt.hash(user.password, 10, (err, hash) => {
    if (err) {
      return next(err);
    }
    user.password = hash;
    next();
  });
});

const basicInfoSchema = new Schema({
  gender: Boolean,
  city: String,
  profession: String,
  user: { type: Schema.Types.ObjectId, ref: 'User' }, // reference to basic user
});

const assetSchema = new Schema({
  name: String,
  owner: String,
  location: String,
  type: String,
  worth: Number,
  description: String,
});

// add static method to the schema, so that the modal
// can call it directly
userSchema.static('sayHello', () => {
  console.info('hello!');
});

export const User = mongoose.model('User', userSchema);
export const BasicInfo = mongoose.model('BasicInfo', basicInfoSchema);
export const Asset = mongoose.model('Asset', assetSchema);

User.authenticate = (name, password, callback) => User.findOne({ name }).exec((err, user) => {
  if (err) {
    return callback(err);
  }
  if (!user) {
    const myError = new Error(`User ${name} not found.`);
    myError.status = 401;
    return callback(myError);
  }

  bcrypt.compare(password, user.password, (err, result) => {
    console.info(password, user.password);
    if (result) {
      // assign null to error, assign user as response data
      return callback(null, user);
    }
    return callback();
  });
});
