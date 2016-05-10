var spawn = require('child_process').spawn;
var statusUtility = require('../utilities/status');
var AOI_RESET_SH = __dirname + '/../../scripts/posm-aoi-reset.sh';
var AOI_FULL_SH = __dirname + '/../../scripts/posm-deploy-full.sh';
var aoiDeployProc;

module.exports = function (io) {
    // register status
    statusUtility.registerProcess('aoi-deploy');

    return function (req, res, next) {
        // We get the url from a url query param or a url field in a JSON POST.
        var url = req.body.url || req.query.url;
        var aoi = req.body.aoi || req.query.aoi;
        var deployProcParam = aoi ? aoi : url;

        // aoi query param results in execution of posm-aoi-reset.sh
        var aoiDeploySh = aoi ? AOI_RESET_SH : AOI_FULL_SH;
        var deployScriptName = aoiDeploySh.substring(aoiDeploySh.lastIndexOf("/")+1, aoiDeploySh.length);

        //reset status
        statusUtility.resetProcess('aoi-deploy');
        // update export url
        statusUtility.update('aoi-deploy', '', {exportUrl: url});

        if (typeof url !== 'string' && typeof res !== 'undefined' && typeof aoi !== 'string' && typeof res !== 'undefined') {
            statusUtility.update('aoi-deploy', '', {error: true});
            res.status(400).json({
                status: 400,
                msg: 'You must provide a URL to a hot export tar.gz OR an aoi name. This can be a url query parameter or url string in a JSON POST.'
            });
            return;
        } else {
            res.status(201).json({
                status: 201,
                msg: 'Doing an aoi deployment starting with fetching a HOT Export tar.gz.',
                remoteUrl: url,
                aoiName: aoi
            });
        }

        function alertSocket(data) {
            if(io) {
                io.emit('aoi-deploy', {
                    controller: 'aoi-deploy',
                    script: deployScriptName,
                    exportUrl: url,
                    output: data.toString(),
                    status: statusUtility.getStatus('aoi-deploy')
                });
                console.log(data.toString());
            }
        }

        aoiDeployProc = spawn(aoiDeploySh, [deployProcParam]);
        aoiDeployProc.stdout.on('data', function (data) {
            statusUtility.update('aoi-deploy', '', {
                initialized: true,
                error: false,
                msg: 'Doing an aoi deployment starting with fetching a HOT Export tar.gz.'
            });
            alertSocket(data);
        });
        aoiDeployProc.stderr.on('data', function (data) {
            statusUtility.update('aoi-deploy', '', {error: true});
            alertSocket(data);
        });
        aoiDeployProc.stdout.on('close', function (code) {
            // When aoi deploy has completed
            statusUtility.update('aoi-deploy', '', {
                initialized: false,
                error: false,
                complete: true,
                msg: "The aoi deployment script has been executed."
            });
            // reset atlas & render db statuses
            statusUtility.resetProcess('render-db');
            statusUtility.resetProcess('atlas-deploy');
            alertSocket(code);
        });
    };

};
