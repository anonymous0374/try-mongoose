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
            const param = name ? {name} : {}
            console.info(`looking for ${name}`)

            User.find(param).exec((err, user) => {
                res.setHeader('Content-Type', 'application/json')
                if (err) {
                    console.error(err)
                    return res.end(JSON.stringify([]))
                }

                console.info(`${name} found`)
                return res.end(JSON.stringify(user))
            })
        })

        app.post('/ams/user/add', (req, res) => {
            res.setHeader('Content-Type', 'application/json')
            const {name, password = ''} = req.query
            console.info(req.query)
            let user = new User({
                name,
                password
            })
            user.save((err, user) => {
                if (err) {
                    console.error(err)
                    return res.end(JSON.stringify({error: 'failed to add user'}))
                }
                return res.end(JSON.stringify(user))
            })
        })
        app.listen(EXPRESS_PORT, (data) => {
            console.info(`express server started at: ${EXPRESS_PORT}`)
        })
    },
    err => {console.error(`connection to ${DB_NAME} has failed. err: `, err)})


