module.exports = function (req,res,next) {
  console.log('isAuthenticated: ', req.isAuthenticated());
  if(req.isAuthenticated() || req.url === '/api/health') {
    next();
  } else {
    req.session.originalUrl = req.originalUrl;
    res.redirect('/auth/authenticate');
  }
};
