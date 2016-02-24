var fs = require('fs');
var mkdirp = require('mkdirp');
var settings = require('../../settings');

module.exports = function (req, res, next) {
    var manifest = req.body;
    // must have name
	if (typeof manifest.name !== 'string') {
		res.status(400).json({
			status: 400,
			msg: 'The manifest must have a "name" field.'
		});
		return;
	}
	// make a directory with the name of the manifest
	var deploymentDir = settings.deploymentsDir + '/' + manifest.name;
    mkdirp(deploymentDir, function (err) {
    	// check for error
    	if (err) {
    		console.error(err);
            res.status(500).json({
            	status: 500, 
            	err: err,
            	msg: 'Unable to create directory for deployment.'
            });
            return;
    	}
    	var manifestPath = deploymentDir + '/manifest.json';
    	fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), function (err) {
    		if (err) {
                console.error(err);
                res.status(500).json({
                	status: 500, 
                	err: err,
                	msg: 'Unable to write manifest file.'
                });
                return;
            }
            res.status(201).json({
            	status: 201,
            	msg: 'Successfully wrote manifest.json to deployments directory.',
            	path: manifestPath
            });
            return;
    	});
    });
};
