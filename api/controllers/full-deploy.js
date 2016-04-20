var spawn = require('child_process').spawn;
var fullDeploySh = __dirname + '/../../scripts/posm-deploy-full.sh';

module.exports = function (io, status) {

    // register status
    if (!status['full-deploy']) {
        status['full-deploy'] = {complete: false, initialized: false, msg: ""};
    }

    function init(req, res, next) {
        // We get the url from a url query param or a url field in a JSON POST.
        var url = req.body.url || req.query.url;
        //reset status
        status['full-deploy'] = {complete: false, initialized: false, msg: ""};

        if (typeof url !== 'string' && typeof res !== 'undefined') {
            status['full-deploy'].error = true;
            res.status(400).json({
                status: 400,
                msg: 'You must provide a URL to a hot export tar.gz. This can be a url query parameter or url string in a JSON POST.'
            });
            return;
        } else {
            res.status(201).json({
                status: 201,
                msg: 'Doing a full deployment starting with fetching a HOT Export tar.gz.',
                remoteUrl: url
            });
        }

        function alertSocket(data) {
            io.emit('full-deploy', {
                controller: 'full-deploy',
                script: 'posm-deploy-full.sh',
                exportUrl: url,
                output: data.toString(),
                status: status['full-deploy']
            });

            status['full-deploy'].exportUrl = url;
        }

        var fullDeployProc = spawn(fullDeploySh, [url]);
        fullDeployProc.stdout.on('data', function (data) {
            status['full-deploy'].initialized = true;
            status["full-deploy"].msg = "Doing a full deployment starting with fetching a HOT Export tar.gz.";
            status['full-deploy'].error = false;
            alertSocket(data);
        });
        fullDeployProc.stderr.on('data', function (data) {
            status['full-deploy'].error = true;
            alertSocket(data);
        });
        fullDeployProc.stdout.on('close', function (code) {
            status["full-deploy"].msg = "The full deployment script has been executed.";
            status['full-deploy'].initialized = false;
            status['full-deploy'].error = false;
            status["full-deploy"].complete = true;
            alertSocket(status);
        });
    }

    return {init: init};

};
