module.exports = function (app, passport) {
  app.get('/auth/authenticate', passport.authenticate('openidconnect', {}));

  app.get('/auth/sso/callback',function(req, res, next) {
    var url = req.session.originalUrl || '/chat';
    
    passport.authenticate('openidconnect', {
      successRedirect: url,
      failureRedirect: '/',
    })(req,res,next);
  });
};
