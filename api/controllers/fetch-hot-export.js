var spawn = require('child_process').spawn;
var fs = require('fs');
var uuid = require('node-uuid');
var settings = require('../../settings');
var shPath = __dirname + '/../../scripts/fetch-hot-export.sh';

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

    var tmpDir = settings.tmpDir + '/' + uuid.v1();
    var shProc = spawn(shPath, [url, tmpDir]);
    shProc.stderr.on('data', function (data) {
        console.log(data.toString());
    });
    shProc.stdout.on('close', function (code) {
        console.log(code);
    });
    //shProc.stderr.pipe(process.stderr);

    res.status(201).json({
        status: 201,
        msg: 'Begun fetching a HOT Export tar.gz.',
        remoteUrl: url,
        tmpDir: tmpDir
    });
};
