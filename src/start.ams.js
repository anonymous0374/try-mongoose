import express from 'express';
import bodyParser from 'body-parser';
// import passport from 'passport';
import session from 'express-session';
import ConnectMongoSession from 'connect-mongo'; // use mongodb to store session data
import escape from 'escape-html';
import { sessionInspector } from './middlewares';
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
// const MongoStore = ConnectMongoSession(session);

function resolved() {
  console.log(`connection to ${DB_NAME} established`);
  const app = express();

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(
    session({
      secret: 'east india company',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: false,
        path: '/',
      },
      // store: new MongoStore()
    }),
  );
  // app.use(passport.initialize());
  // app.use(passport.session());
  app.use(sessionInspector); // session inspector

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
              'Sorry, the password you provided was invalid. <br />Please call our help desk if you need help.',
          }),
        );
      }

      req.session.user = name; // add 'user' property to session
      return res.end(
        JSON.stringify({
          code: SUCCESS,
          authenticated: true,
          user,
        }),
      );
    });
  });

  app.post('/ams/logout', (req, res, next) => {
    if (req.session) {
      // if there is session, destroy it
      return req.session.destroy((err) => {
        if (err) {
          return next(err);
        }
        return res.end(
          JSON.stringify({ code: 0, auth: { authenticate: false, name: 'Guest' }, user: null }),
        );
      });
    }

    return res.end(
      JSON.stringify({ code: 0, auth: { authenticate: false, name: 'Guest' }, user: null }),
    );
  });

  app.post('/ams/user/get', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    // get name from request cookie
    if (req.session) {
      const {
        session: { user: name },
      } = req;

      if (name && name !== 'Guest') {
        return User.findOne({ name }).exec((err, user) => {
          if (err) {
            return res.end(
              JSON.stringify({
                code: 0,
                authenticated: false,
                name: 'Guest',
                msg: `Sorry, we can't find '${name}' in our system: `,
              }),
            );
          }
          const { email, abandoned } = user;
          return res.end(
            JSON.stringify({
              code: 0,
              name,
              email,
              abandoned,
              authenticated: true,
            }),
          );
        });
      }
    }

    return res.end(
      JSON.stringify({
        code: 0,
        authenticated: false,
        name: 'Guest',
      }),
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

  // cashflow
  app.post('/ams/cashflow/add', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    const {
      body: { params },
    } = req;
    if (!params || Object.keys(params).length === 0) {
      throw new Error('User need to input data to log a Cashflow event.');
    }
    const {
      amount, paymentMethod, direction, dueDate, remark,
    } = params;
    const owner = req.session.user;
    const dateTime = new Date();

    return res.end(
      JSON.stringify({
        code: 0,
        amount,
        paymentMethod,
        direction,
        dueDate,
        remark,
        owner,
        dateTime,
      }),
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
