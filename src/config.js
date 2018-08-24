/*
* file name: init_db.js
* use: to define Schemas of the Assets Management System Database.
* author: j-sparrow
* inital date: 2018-08-07
* version: 0.1
*/

export const mongoose = require('mongoose');

export const PORT = 27017;
export const EXPRESS_PORT = 3001;
export const DB_NAME = 'ams';
export const DB_CNN_URL = `mongodb://localhost:${PORT}/${DB_NAME}`;
export const options = {
  useNewUrlParser: true,
  autoIndex: false, // Don't build indexes
  reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
  reconnectInterval: 500, // Reconnect every 500ms
  poolSize: 10, // Maintain up to 10 socket connections
  bufferMaxEntries: 0, // If not connected, return errors immediately rather than waiting for reconnect
  connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4, // Use IPv4, skip trying IPv6
};

// Codes
export const SUCCESS = 0;
export const ERROR = -1;
export const NOT_LOGIN = -2;
export const NO_ACCESS = 401;
export const NOT_FOUND = -4;

export const ACCESS_WHITE_LIST = [
  '/ams/login',
  '/ams/user/get',
  '/ams/user/add',
  '/ams/logout',
  '/ams/register',
];
