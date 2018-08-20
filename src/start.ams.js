import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import session from 'express-session';
import url from 'url';
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
    app.use(cookieParser());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(session({ secret: 'east india company', resave: false, saveUninitialized: false }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(auth); // custom middle, used to do authentication depends on session

    app.post('/ams/login', (req, res) => {
      const {
        params: { name, password },
      } = req.body;

      User.authenticate(name, password, (err, user) => {
        if (err) {
          throw new Error(err.message);
        }

        res.redirect('/assets');
      });
      /*
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
          // console.info(res);
          // req.session.name = user.name;
          res.setHeader('Set-Cookie', [`name=${user.name};domain=ams.com;path=/`]);
          return res.end(JSON.stringify({ user, msg: 'successful', code: 0 }));
        }

        return res.end(JSON.stringify({ msg: 'authentication failed', code: -1 }));

      }); */
    });

    app.get('/ams/logout', (req, res, next) => {
      if (req.session) {
        // if there is session, destroy it
        req.session.destory((err) => {
          if (err) {
            return next(err);
          }
          return res.redirect('/');
        });
      }
    });

    // an authentication middleware that checkes EVERY http request
    function auth(req, res, next) {
      const urlParts = url.parse(req.url);
      const { pathname } = urlParts;
      const whiteList = ['/ams/login'];
      if (whiteList.includes(pathname)) {
        // don't block login page
        return next();
      }
      if (req.session && req.session.name) {
        // otherwise check session existance
        return next();
      }

      const err = new Error('You have to login to access this territory.');
      err.status = 401;
      return next(err);
    }

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

    app.listen(EXPRESS_PORT, (data) => {
      console.info(`express server started at: ${EXPRESS_PORT}`);
    });
  },
  (err) => {
    console.error(`connection to ${DB_NAME} has failed. err: `, err);
  },
);
