var spawn = require('child_process').spawn;
var fs = require('fs');
var uuid = require('node-uuid');
var settings = require('../../settings');
var fetchSh = __dirname + '/../../scripts/hot-export-fetch.sh';
var moveSh = __dirname + '/../../scripts/hot-export-move.sh';

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

    var id = uuid.v1();
    var tmpDir = settings.tmpDir + '/' + id;
    var fetchProc = spawn(fetchSh, [url, tmpDir]);
    fetchProc.stderr.on('data', function (data) {
        console.log(data.toString());
    });
    fetchProc.stdout.on('close', function (code) {
        moveToDeploymentsDir(tmpDir);
    });
    //shProc.stderr.pipe(process.stderr);

    res.status(201).json({
        status: 201,
        msg: 'Begun fetching a HOT Export tar.gz.',
        remoteUrl: url,
        tmpDir: tmpDir,
        uuid: id
    });
};

function moveToDeploymentsDir(tmpDir) {
    fs.readFile(tmpDir + '/manifest.json', 'utf8', function (err, data) {
        if (err) {
            console.error(err);
            return;
        }
        var manifest = JSON.parse(data);
        if (typeof manifest === 'object') {
            var name = manifest.name;
            if (typeof name !== 'string') {
                console.error('no name');
                return;
            }
            var deploymentDir = settings.deploymentsDir + '/' + name;
            var moveProc = spawn(moveSh, [tmpDir, deploymentDir]);
            moveProc.stdout.on('data', function (data) {
                console.log(data.toString());
            });
            moveProc.stdout.on('close', function (code) {
                console.log(code);

            });
        }
    });
}