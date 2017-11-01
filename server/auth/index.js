var session = require('express-session');
var passport = require('passport');
var querystring = require('querystring');
var settings = JSON.parse(process.env.SSO_SETTINGS);

/*function _setRedis (config) {
  var RedisStore = require('connect-redis')(session);

  var options = {
    url: config.uri
  };

  return new RedisStore(options);
}*/

module.exports = function (app, env, config) {
  var sessionOptions = {
    resave: false,
    saveUninitialized: 'true',
    secret: '%5up3r#mobile@At@IBM#53cr37!',
    cookie: {maxAge: 13*60*60*1000 }
  };

  if (!env.isLocal) {

    //sessionOptions.store = _setRedis(config.redis);
  }

  app.use(session(sessionOptions));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser(function(user, done) { done(null, user); });
  passport.deserializeUser(function(obj, done) { done(null, obj); });

  var OpenIDConnectStrategy = require('passport-idaas-openidconnect').IDaaSOIDCStrategy;
  var Strategy = new OpenIDConnectStrategy(settings, function(iss, sub, profile, accessToken, refreshToken, params, done)  {
    process.nextTick(function() {
      profile.accessToken = accessToken;
      profile.refreshToken = refreshToken;
      done(null, profile);
    });
  });

  passport.use(Strategy);

  require('./routes')(app, passport);
};
