import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import session from 'express-session';
import ConnectMongoSession from 'connect-mongo';
import { checkSession } from './middlewares';
import {
  mongoose,
  EXPRESS_PORT,
  DB_NAME,
  DB_CNN_URL,
  options,
  SUCCESS,
  ERROR,
  NOT_LOGIN,
  NO_ACCESS,
  NOT_FOUND,
} from './config';
import { BasicInfo, User, Asset } from './schemas';

// connection is a promise to connect to mongodb server
const connection = mongoose.connect(
  DB_CNN_URL,
  options,
);
const MongoStore = ConnectMongoSession(session);

function resolved() {
  console.log(`connection to ${DB_NAME} established`);
  const app = express();
  app.use(cookieParser());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(
    session({
      secret: 'east india company',
      resave: false,
      saveUninitialized: false,
      // store: new MongoStore()
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(checkSession); // custom middle, used to do authentication depends on session

  app.post('/ams/login', (req, res) => {
    const {
      params: { name, password },
    } = req.body;

    res.setHeader('Content-Type', 'application/json');
    User.authenticate(name, password, (err, user) => {
      if (err) {
        // throw new Error(err.message);
        return res.end(
          JSON.stringify({
            code: NOT_LOGIN,
            msg:
              'Sorry, the password you provided was invalid. Please call our help desk if you need help.',
          }),
        );
      }

      res.setHeader('Set-Cookie', [`name=${name};domain=ams.com;path=/`]);
      return res.end(
        JSON.stringify({
          code: SUCCESS,
          authenticated: true,
          user,
        }),
      );
    });
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

  app.post('/ams/user/get', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    // get name from request cookie
    const {
      cookies: { name },
    } = req;
    const queryPromise = User.findOne({ name }).exec();
    queryPromise.then(
      (user) => {
        const { name, email, abandoned } = user;
        return res.end(JSON.stringify({
          code: 0, name, email, abandoned, authenticated: true,
        }));
      },
      err => res.end(
        JSON.stringify({
          code: 0,
          authenticated: false,
          name: 'Guest',
          msg: err,
        }),
      ),
    );
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

  app.listen(EXPRESS_PORT, () => {
    console.info(`express server started at: ${EXPRESS_PORT}`);
  });
}

function rejected(err) {
  console.error(`connection to ${DB_NAME} has failed. err: `, err);
}

connection.then(resolved, rejected);
