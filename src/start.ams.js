import express from 'express';
import bodyParser from 'body-parser';
import cookieSession from 'cookie-session';
import {
  mongoose, stringifyObjId, PORT, DB_NAME, cnn_url, options,
} from './config';
import { BasicInfo, User, Asset } from './schemas';

const EXPRESS_PORT = 3001;

// connect to mongodb server
mongoose.connect(
  cnn_url,
  options,
  () => {
    console.log(`connection to ${DB_NAME} established`);
    const app = express();
    /*
    app.use(
      cookieSession({
        name: 'session',
        keys: ['name'],
        httpOnly: true,
      }),
    );
    */
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.post('/ams/login', (req, res) => {
      const {
        params: { name, password },
      } = req.body;
      User.findOne({ name }).exec((err, user) => {
        res.setHeader('Content-Type', 'application/json');
        if (err || !user) {
          return res.end(
            JSON.stringify({
              msg: user
                ? `authentication failed: ${err.toString()}`
                : 'authentication failed: no such user',
              code: -1,
            }),
          );
        }
        if (password === user.password) {
          // req.session.name = user.name;
          console.info(res);
          res.setHeader('Set-Cookie', [`name=${user.name}`]);
          return res.end(JSON.stringify({ user, msg: 'successful', code: 0 }));
        }

        return res.end(JSON.stringify({ msg: 'authentication failed', code: -1 }));
      });
    });

    app.post('/ams/user/add', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      const {
        params: { basicInfo, extraInfo },
      } = req.body;
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
          name: basicInfo.name,
          email: basicInfo.email,
          password: basicInfo.password,
          basicInfo: _id,
        });
        newUser.save((err, rspUser) => {
          if (err) {
            console.error(err);
            return res.end(JSON.stringify({ msg: 'failed to register user', code: -1 }));
          }
          return res.end(JSON.stringify({ code: 0, ...basicInfo, ...extraInfo }));
        });
      });
    });

    app.get('/ams/assets', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      const { name } = req.query;
      const query = Asset.find({ owner: name });
      const promise = query.exec();
      promise.then(
        data => res.end(JSON.stringify({ code: 0, data })),
        err => res.end(JSON.stringify({ code: -1, msg: `something went wrong: ${err}` })),
      );
    });

    app.get('/ams/logout', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      const { name } = req.query;
      // need to do some session / cookie management here
      res.end(
        JSON.stringify({ code: 0, msg: 'sorry, session / cookie management not in place yet' }),
      );
    });

    app.listen(EXPRESS_PORT, (data) => {
      console.info(`express server started at: ${EXPRESS_PORT}`);
    });
  },
  (err) => {
    console.error(`connection to ${DB_NAME} has failed. err: `, err);
  },
);
