/*
* file name: init_db.js
* use: to define Schemas of the Assets Management System Database.
* author: j-sparrow
* inital date: 2018-08-07
* version: 0.1
*/

export const mongoose = require('mongoose')
export const stringifyObjId = (o) => {
    o._id = o._id.toString()
    return o
}
export const PORT = 27017
export const DB_NAME = 'ams'
export const cnn_url = `mongodb://localhost:${PORT}/${DB_NAME}`
export const options = {
    useNewUrlParser: true,
    autoIndex: false, // Don't build indexes
    reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
    reconnectInterval: 500, // Reconnect every 500ms
    poolSize: 10, // Maintain up to 10 socket connections
    // If not connected, return errors immediately rather than waiting for reconnect
    bufferMaxEntries: 0,
    connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    family: 4 // Use IPv4, skip trying IPv6
}



