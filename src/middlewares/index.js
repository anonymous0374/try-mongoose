import url from 'url';
import { ACCESS_WHITE_LIST } from '../config';

export function sessionInspector(req, res, next) {
  const urlParts = url.parse(req.url);
  const { pathname } = urlParts;
  if (ACCESS_WHITE_LIST.includes(pathname)) {
    // does not need a session
    return next();
  }

  if (req.session && req.session.id) {
    // session established
    console.info('session id: ', req.sessionID);
    const { user } = req.session;
    if (user && user !== 'Guest') {
      return next();
    }
  }

  // need a session, but none was found
  const err = new Error('You have to login to access this territory.');
  err.status = 401;
  return res.end(
    JSON.stringify({
      code: 401,
      msg: 'You have to login to access this territory.',
      authenticated: false,
    }),
  );
}

export function placeHolder() {}
