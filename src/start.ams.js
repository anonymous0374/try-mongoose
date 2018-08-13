import {mongoose, stringifyObjId, PORT, DB_NAME, cnn_url, options} from './config'
import {BasicInfo, User} from './schemas'
import express from 'express'
import bodyParser from 'body-parser'

// connect to mongodb server
mongoose.connect(cnn_url, options,
    () => {
        console.log(`connection to ${DB_NAME} established`)
        const app = express()
        const EXPRESS_PORT = 3001
        app.get('/ams/user', function (req, res) {
            const name = req.query.name
            console.info(`looking for ${name}`)
            return User.find({name}).exec((err, user) => {
                return user
            })

        })
        app.listen(EXPRESS_PORT, (data) => {
            console.info(`express server started at: ${EXPRESS_PORT}`)
        })
    },
    err => {console.error(`connection to ${DB_NAME} has failed. err: `, err)})


