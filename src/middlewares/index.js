import url from 'url';

// an authentication middleware that checkes EVERY http request
export function auth(req, res, next) {
  const urlParts = url.parse(req.url);
  const { pathname } = urlParts;
  const whiteList = ['/ams/login'];
  if (whiteList.includes(pathname)) {
    // no authentication for login page
    return next();
  }

  if (req.session && req.session.id) {
    // authentication pased
    return next();
  }

  // authentication failed
  const err = new Error('You have to login to access this territory.');
  err.status = 401;
  return next(err);
}
