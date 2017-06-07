var utils = require('./utils');
var fakeUser = require('./utils/fake_user');
var communityUrl = process.env.COMMUNITY_URL;

module.exports = function (app, appEnv) {

  app.get('/api/info', function (req, res) {
    var user, device;
    try {
      console.log("User data: ");
      console.error(req.rawHeaders[3]);
      if (!req.session.refinedData) {
        req.session.refinedData = utils.buildUserObj(req.user._json);
        req.session.device = utils.mobileOrDesktop(/*req.user._json.userAgent*/req.rawHeaders[3]);
      }
      user = req.session.refinedData;
      device = req.session.device;
    } catch (e) {
      // dev purposes
      if (appEnv.isLocal) {
        var fake = fakeUser();
        user = fake.user;
        device = fake.device;
      } else {
        console.error('Error: Session data does not exist.');
        res.status(500).json({
          message: 'Sorry, a problem was found while processing your information. Please try again.',
          error: 'Session data not found'
        });

        return;
      }
    }
    res.json({user: user, device: device, community: communityUrl});
  });

};
