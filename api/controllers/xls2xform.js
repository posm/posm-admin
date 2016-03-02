var spawn = require('child_process').spawn;
var settings = require('../../settings');
var omkServerPath = settings.omkServerPath;
var omkFormsDir = omkServerPath + '/data/forms';
var xls2xformSh = __dirname + '/../../scripts/xls2xform.sh';
var xls2xformPy = omkServerPath + '/api/odk/pyxform/pyxform/xls2xform.py';

module.exports = function (io, deploymentsStatus, deployName) {
    return function (req, res, next) {
        var deployment = deployName || req.body.deployment || req.query.deployment;
        if (typeof deployment !== 'string') {
            res.status(400).json({
                status: 400,
                msg: "You must provide a deployment name. This can be in a {deployment: '<name>'} object in a JSON POST or a deployment=<name> query parameter in a GET."
            });
            return;
        }

        var deploymentContentsDir = settings.deploymentsDir + '/' + deployment + '/contents';
        var fetchProc = spawn(xls2xformSh, [xls2xformPy, deploymentContentsDir, omkFormsDir]);
        fetchProc.stdout.on('data', function (data) {
            io.emit('deployments/' + deployment, {
                controller: 'xls2xform',
                script: 'xls2xform.sh',
                output: data.toString()
            });
            console.log(data.toString());
        });
        fetchProc.stdout.on('close', function (code) {
            if (!deploymentsStatus[deployment]) deploymentsStatus[deployment] = {};
            if (code === false) {
                deploymentsStatus[deployment].xls2xform = 'done';
            } else {
                deploymentsStatus[deployment].xls2xform = 'error';
            }
            io.emit('deployments/' + deployment, {
                controller: 'xls2xform',
                close: true,
                code: code,
                deployment: deployment,
                status: deploymentsStatus[deployment]
            });
            console.log(code);
        });

        if (typeof res !== 'undefined') {
            res.status(201).json({
                status: 201,
                msg: 'Converting xlsx in ' + deployment + ' deployment to XForms XML and putting files in OpenMapKit Server forms directory.',
                deploymentContentsDir: deploymentContentsDir,
                omkFormsDir: omkFormsDir,
                deployment: deployment
            });
        }
    };
};
