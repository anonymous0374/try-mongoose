import express from 'express';
import bodyParser from 'body-parser';
import {
  mongoose, stringifyObjId, PORT, DB_NAME, cnn_url, options,
} from './config';
import { BasicInfo, User } from './schemas';

const EXPRESS_PORT = 3001;

// connect to mongodb server
mongoose.connect(cnn_url, options,
  () => {
    console.log(`connection to ${DB_NAME} established`);
    const app = express();
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.post('/ams/login', (req, res) => {
      const { params: { name, password } } = req.body;
      User.findOne({ name }).exec((err, user) => {
        res.setHeader('Content-Type', 'application/json');
        if (err || !user) {
          return res.end(JSON.stringify({ msg: user ? `authentication failed: ${err.toString()}` : 'authentication failed: no such user', code: -1 }));
        }
        if (password === user.password) {
          return res.end(JSON.stringify({ user, msg: 'successful', code: 0 }));
        }

        return res.end(JSON.stringify({ msg: 'authentication failed', code: -1 }));
      });
    });

    app.post('/ams/user/add', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      console.info(req.body);
      const { params: { basicInfo, extraInfo } } = req.body;
      console.info('basicInfo: ', basicInfo, '\nextraInfo: ', extraInfo);
      const newBasicInfo = new BasicInfo({
        city: extraInfo.city,
        gender: extraInfo.gender,
        profession: extraInfo.profession,
      });

      newBasicInfo.save((err, rspBasicInfo) => {
        if (err) {
          console.error(err);
          return res.end(JSON.stringify({ msg: 'failed to register user', code: -1 }));
        }
        const { _id } = rspBasicInfo;
        const newUser = new User({
          name: basicInfo.userName,
          email: basicInfo.email,
          password: basicInfo.password,
          basicInfo: _id,
        });
        newUser.save((err, rspUser) => {
          if (err) {
            console.error(err);
            return res.end(JSON.stringify({ msg: 'failed to register user', code: -1 }));
          }
          console.info(JSON.stringify({ code: 0, ...basicInfo, ...extraInfo }));
          return res.end(JSON.stringify({ code: 0, ...basicInfo, ...extraInfo }));
        });
      });
    });
    app.listen(EXPRESS_PORT, (data) => {
      console.info(`express server started at: ${EXPRESS_PORT}`);
    });
  },
  (err) => { console.error(`connection to ${DB_NAME} has failed. err: `, err); });
