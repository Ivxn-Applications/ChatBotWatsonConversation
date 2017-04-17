function allowCrossDomain(req, res, next) {
    res.header('Access-Control-Allow-Origin', 'example.com');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
}

/**
 * A simple end point to check if server is up.
 * @param  {Object} app
 */
module.exports = function health (app) {

  app.get('/api/health', allowCrossDomain, function (req, res) {

    res.status(200).send('Everything is ok, thanks for asking.');

  });

};