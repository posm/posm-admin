var spawn = require('child_process').spawn;
var fs = require('fs');
var settings = require('../../settings');
var apidbDropCreateSh = __dirname + '/../../scripts/api-db-drop-create.sh';
var apidbInitSh = __dirname + '/../../scripts/api-db-init.sh';
var apidbPopulateSh = __dirname + '/../../scripts/api-db-populate.sh';

module.exports = function (io, deploymentsStatus, fullDeployName) {

	function reset(req, res, next) {
		// If we don't specify a deployment, that's ok, we just do it with 'undefined'.
		// This reset is not dependent on knowing what deployment is associated.
		var deployment = fullDeployName || req.body.deployment || req.query.deployment || 'undefined';
		
		// sudo -u postgres /opt/admin/posm-admin/scripts/api-db-drop-create.sh
		var apidbDropCreateProc = spawn('sudo', ['-u', 'postgres', apidbDropCreateSh]);
		apidbDropCreateProc.stdout.on('data', function (data) {
            io.emit('deployments/' + deployment, {
                controller: 'api-db',
                script: 'api-db-drop-create.sh',
                output: data.toString()
            });
            console.log(data.toString());
        });
        apidbDropCreateProc.stdout.on('close', function (code) {
            var apidbInitProc = spawn('sudo', ['-u', 'osm', apidbInitSh]);
            apidbInitProc.stdout.on('data', function (data) {
	            io.emit('deployments/' + deployment, {
	                controller: 'api-db',
	                script: 'api-db-init.sh',
	                output: data.toString()
	            });
	            console.log(data.toString());
	        });
	        apidbInitProc.stdout.on('close', function (code) {
	        	if (!deploymentsStatus[deployment]) deploymentsStatus[deployment] = {};
	        	if (code === false) {
	        		deploymentsStatus[deployment] = {'api-db/reset': 'done'};
	        	} else {
	        		deploymentsStatus[deployment] = {'api-db/reset': 'error'};
	        	}
	        	io.emit('deployments/' + deployment, {
	        		controller: 'api-db',
	        		method: 'reset',
	        		close: true,
	        		code: code,
	        		deployment: deployment,
	        		status: deploymentsStatus[deployment]
	        	});
	        	// used by resetAndPopulate
	        	if (code === false && typeof next === 'function') {
	        		next();
	        	}
	        });
        });

		res.status(200).json({
			status: 200,
			deployment: deployment,
			msg: 'Dropping, creating, and initializing new API DB.'
		});
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