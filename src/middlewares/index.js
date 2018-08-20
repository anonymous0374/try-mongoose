// an authentication middleware that checkes EVERY http request
export function auth(req, res, next) {
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
