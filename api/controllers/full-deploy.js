var spawn = require('child_process').spawn;
var fullDeploySh = __dirname + '/../../scripts/posm-deploy-full.sh';

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

        function alertSocket(data) {
            io.emit('full-deploy', {
                controller: 'full-deploy',
                script: 'posm-deploy-full.sh',
                output: data.toString()
            });
            console.log(data.toString());
        }

        var fullDeployProc = spawn(fullDeploySh, [url]);
        fullDeployProc.stdout.on('data', function (data) {
            alertSocket(data);
        });
        fullDeployProc.stderr.on('data', function (data) {
            alertSocket(data);
        });
        fullDeployProc.stdout.on('close', function (code) {
            // TODO
        });

        res.status(201).json({
            status: 201,
            msg: 'Doing a full deployment starting with fetchign a HOT Export tar.gz.',
            remoteUrl: url
        });
    };

};
