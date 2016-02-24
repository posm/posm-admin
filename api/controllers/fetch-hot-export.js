var fs = require('fs');
var mkdirp = require('mkdirp');
var request = require('request');
var progress = require('request-progress');
var uuid = require('node-uuid');
var settings = require('../../settings');

module.exports = function (req, res, next) {
    // We get the url from a url query param or a url field in a JSON POST.
    var url = req.query.url || req.body.url;
    if (typeof url !== 'string') {
        res.status(400).json({
            status: 400,
            msg: 'You must provide a URL to a hot export tar.gz. This can be a url query parameter or url string in a JSON POST.'
        });
        return;
    }
    var tarFilePath = settings.tmpDir + '/' + uuid.v1() + '.tar.gz';
    var tarStream = fs.createWriteStream(tarFilePath);
    progress(request(url))
        .on('progress', function (state) {
            console.log(state);
        })
        .on('error', function (err) {
            console.log(err);
        })
        .on('finish', function () {
            console.log('done');
        })
        .pipe(tarStream);

    res.status(201).json({
        status: 201,
        msg: 'Begun fetching a HOT Export tar.gz.',
        remoteUrl: url,
        tarFilePath: tarFilePath
    });
};
