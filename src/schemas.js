/*
* file name: schemas.js
* use: to define Schemas of the Assets Management System Database.
* author: j-sparrow
* inital date: 2018-08-08
* version: 0.1
* Add validations to schema
* version: 0.2
*/

import bcrypt from 'bcrypt';
import { mongoose } from './config';

const { Schema } = mongoose;

// define schemas
const userSchema = new Schema({
  name: {
    type: String,
    required: [true, 'must proivde uname'],
  },
  password: {
    type: String,
    required: [true, 'must provide pasdsword'],
  },
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
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Keep it Private'],
  },
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

const flowEventSchema = new Schema({
  owner: {
    requred: [true, 'must provide owner'],
    type: String,
  },
  amount: {
    required: [true, 'must provide amount'],
    type: Number,
  },
  paymentMethod: {
    type: String,
    enum: ['cash', "yu'er bao", 'ant credit pay', 'credit card'],
  },
  direction: {
    required: [true, 'must provide flowDirection'],
    type: String,
    enum: ['flow in', 'flow out'],
  },
  dueDate: Date, // when will this payment dues
  dateTime: {
    required: [true, 'must provide dateTime'],
    type: Date,
  }, // when this flow is created
  remark: String,
});

// add static method to the schema, so that the modal
// can call it directly
userSchema.static('sayHello', () => {
  console.info('hello!');
});

export const User = mongoose.model('User', userSchema);
export const BasicInfo = mongoose.model('BasicInfo', basicInfoSchema);
export const Asset = mongoose.model('Asset', assetSchema);
export const FlowEvent = mongoose.model('DailyFlow', flowEventSchema);

// define authenticate like a middleware
User.authenticate = (name, password, callback) => User.findOne({ name }).exec((err, user) => {
  if (err) {
    return callback(err);
  }
  if (!user) {
    const myError = new Error(`User ${name} not found.`);
    myError.status = 401;
    return callback(myError);
  }

  bcrypt.compare(password, user.password, (err, comparedResult) => {
    if (comparedResult) {
      // assign null to error, assign user as response data
      return callback(null, user);
    }
    return callback(
      new Error('Sorry, your password is invalid. Got questions? Please call XXX XXX'),
    );
  });
});
