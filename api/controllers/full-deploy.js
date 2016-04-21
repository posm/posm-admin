var spawn = require('child_process').spawn;
var fullDeploySh = __dirname + '/../../scripts/posm-deploy-full.sh';
var statusUtility = require('../utilities/status');

module.exports = function (io, status) {

    // register status
    statusUtility.registerProcess('full-deploy');

    function init(req, res, next) {
        // We get the url from a url query param or a url field in a JSON POST.
        var url = req.body.url || req.query.url;
        //reset status
        statusUtility.resetProcess('full-deploy');
        // update export url
        statusUtility.update('full-deploy', '', {exportUrl: url});

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
                status: statusUtility.getStatus('full-deploy')
            });
        }
        var fullDeployProc = spawn(fullDeploySh, [url]);
        fullDeployProc.stdout.on('data', function (data) {
            statusUtility.update('full-deploy', '', {initialized: true, error:false, msg: 'Doing a full deployment starting with fetching a HOT Export tar.gz.'});
            alertSocket(data);
        });
        fullDeployProc.stderr.on('data', function (data) {
            statusUtility.update('full-deploy', '', {error:true});
            alertSocket(data);
        });
        fullDeployProc.stdout.on('close', function (code) {
            statusUtility.update('full-deploy', '', {initialized : false, error : false, complete : true, msg : "The full deployment script has been executed."});
            alertSocket(code);
        });
    }

    return {init: init};

};
