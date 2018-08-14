import {mongoose, stringifyObjId, PORT, DB_NAME, cnn_url, options} from './config'
import {BasicInfo, User} from './schemas'
import express from 'express'
import bodyParser from 'body-parser'

// connect to mongodb server
mongoose.connect(cnn_url, options,
    () => {
        console.log(`connection to ${DB_NAME} established`)
        const app = express()
        app.use(bodyParser.json())
        app.use(bodyParser.urlencoded({extended: true}))
        const EXPRESS_PORT = 3001
        app.post('/ams/login', function (req, res) {
            const {params: {name, password}} = req.body
            User.findOne({name}).exec((err, user) => {
                res.setHeader('Content-Type', 'application/json')
                if (err || !user) {
                    return res.end(JSON.stringify({msg: user ? `authentication failed: ${err.toString()}` : 'authentication failed: no such user', code: -1}))
                }
                if (password === user.password) {
                    return res.end(JSON.stringify({user, msg: 'successful', code: 0}))
                }

                return res.end(JSON.stringify({msg: 'authentication failed', code: -1}))
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
                    return res.end(JSON.stringify({msg: 'failed to add user', code: -1}))
                }
                return res.end(JSON.stringify(user))
            })
        })
        app.listen(EXPRESS_PORT, (data) => {
            console.info(`express server started at: ${EXPRESS_PORT}`)
        })
    },
    err => {console.error(`connection to ${DB_NAME} has failed. err: `, err)})


