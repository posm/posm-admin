var spawn = require('child_process').spawn;
var fs = require('fs');
var settings = require('../../settings');
var apidbDropCreateSh = __dirname + '/../../scripts/api-db-drop-create.sh';
var apidbInitSh = __dirname + '/../../scripts/api-db-init.sh';
var apidbPopulateSh = __dirname + '/../../scripts/api-db-populate.sh';

module.exports = function (io, deploymentsStatus, fullDeploy) {

	function reset(req, res, next) {
		var deployment = deploymentName || req.body.deployment || req.query.deployment;
		if (typeof deployment !== 'string') {
            res.status(400).json({
                status: 400,
                msg: "You must provide a deployment name. This can be in a {deployment: '<name>'} object in a JSON POST or a deployment=<name> query parameter in a GET."
            });
            return;
        }
        
	}

	function populate(req, res, next) {

	}

	function resetAndPopulate(req, res, next) {
		reset(null, null, function() {
			populate(null, null, function() {

			});
		});
	}

	return { reset: reset, populate: populate, resetAndPopulate: resetAndPopulate };
};