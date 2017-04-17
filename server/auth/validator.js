module.exports = function (req,res,next) {
  // console.log('isAuthenticated: ', req.isAuthenticated());
  // console.log(req.user);
  if(req.isAuthenticated() || req.url === '/api/health') {
    next();
  } else {
    req.session.originalUrl = req.originalUrl;
    res.redirect('/auth/authenticate');
  }
};
