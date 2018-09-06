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

/**
* mantain 10 latest visited url location in session
*/
export function historyManager(req, res, next) {
  const MAX_LEN = 10;
  const DOMAIN_NAME = req.hostname;
  const PATH = req.path;
  // const LOCATION = `${req.protocol}://${req.hostname}${req.path}`;
  const LOCATION = req.get('referer');
  const { session } = req;
  if (!session) {
    return next();
  }

  console.info(`path: ${PATH}, location: ${LOCATION}`);

  if (!LOCATION.endsWith('/login')) {
    const { history } = req.session;
    const hisArr = history ? JSON.parse(history) : [];
    const len = hisArr.length;

    len === 10 ? hisArr.pop() : '';
    hisArr.push(LOCATION);

    console.info('hisArr: ', hisArr);
    req.session.history = JSON.stringify(hisArr);

    console.info('req.session: ', session);
  }

  return next();
}
