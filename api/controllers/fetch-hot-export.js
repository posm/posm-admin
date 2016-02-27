var spawn = require('child_process').spawn;
var fs = require('fs');
var uuid = require('node-uuid');
var settings = require('../../settings');
var xls2xform = require('./xls2xform');
var fetchSh = __dirname + '/../../scripts/hot-export-fetch.sh';
var moveSh = __dirname + '/../../scripts/hot-export-move.sh';

module.exports = function (io, deploymentsStatus, fullDeploy) {
    return function (req, res, next) {
        // We get the url from a url query param or a url field in a JSON POST.
        var url = req.body.url || req.query.url;
        if (typeof url !== 'string' && typeof res !== 'undefined') {
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
            io.emit(id, {
                controller: 'fetch-hot-export',
                script: 'hot-export-fetch.sh',
                output: data.toString()
            });
            //console.log(data.toString());
        });
        fetchProc.stdout.on('close', function (code) {
            moveToDeploymentsDir(tmpDir, id);
        });
        fetchProc.stderr.pipe(process.stderr);

        if (typeof res !== 'undefined') {
            if (fullDeploy) {
                var msg = 'Doing a full deployment starting with fetchign a HOT Export tar.gz.';
            } else {
                var msg = 'Fetching a HOT Export tar.gz.';
            }
            res.status(201).json({
                status: 201,
                msg: msg,
                remoteUrl: url,
                tmpDir: tmpDir,
                uuid: id
            });
        }
    };

    function moveToDeploymentsDir(tmpDir, id) {
        fs.readFile(tmpDir + '/manifest.json', 'utf8', function (err, data) {
            if (err) {
                // no manifest.json - probably the tar.gz is not there or is missing manifest.json
                if (err.errno === -2) { //ENOENT
                    io.emit('fetch-hot-export ' + id, {
                        error: true,
                        msg: 'The HOT Export is invalid. Check that the tar.gz downloads and is valid.',
                        err: err
                    });
                }
                console.error(err);
                return;
            }
            var manifest = JSON.parse(data);
            if (typeof manifest === 'object') {
                var name = manifest.name;
                if (typeof name !== 'string') {
                    var msg = 'Your tar.gz manfiest.json is missing a name field';
                    io.emit(id, {
                        controller: 'fetch-hot-export',
                        error: true,
                        msg: msg
                    });
                    console.error(msg);
                    return;
                }
                var deploymentDir = settings.deploymentsDir + '/' + name;
                var moveProc = spawn(moveSh, [tmpDir, deploymentDir]);
                moveProc.stdout.on('data', function (data) {
                    io.emit(id, {
                        controller: 'fetch-hot-export',
                        script: 'hot-export-move.sh',
                        output: data.toString()
                    });
                });
                moveProc.stdout.on('close', function (code) {
                    if (code === false) {
                        deploymentsStatus[name] = {'fetch-hot-export': 'done'};
                    } else {
                        deploymentsStatus[name] = {'fetch-hot-export': 'error'};
                    }
                    io.emit(id, {
                        controller: 'fetch-hot-export',
                        close: true,
                        code: code,
                        manifest: manifest,
                        status: deploymentsStatus[name]
                    });
                    console.log(code);
                    if (fullDeploy) {
                        xls2xform(io, deploymentsStatus, name)();
                    }
                });
            }
        });
    }
};
