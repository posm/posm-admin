var spawn = require('child_process').spawn;
var fs = require('fs');
var settings = require('../../settings');
var apidbDropCreateSh = __dirname + '/../../scripts/postgres_api-db-drop-create.sh';
var apidbInitSh = __dirname + '/../../scripts/osm_api-db-init.sh';
var apidbPopulateSh = __dirname + '/../../scripts/osm_api-db-populate.sh';
var apidbBackup = __dirname + '/../../scripts/osm_api-db-backup.sh';

module.exports = function (io, deploymentsStatus, deployName) {

	function reset(req, res, next) {
		// If we don't specify a deployment, that's ok, we just do it with 'undefined'.
		// This reset is not dependent on knowing what deployment is associated.
		var deployment = deployName || req.body.deployment || req.query.deployment || 'undefined';

		// sudo -u postgres /opt/admin/posm-admin/scripts/postgres_api-db-drop-create.sh
		var apidbDropCreateProc = spawn('sudo', ['-u', 'postgres', apidbDropCreateSh]);

		function alertSocket(data) {
			io.emit('deployments/' + deployment, {
                controller: 'api-db',
                method: 'reset',
                script: 'api-db-drop-create.sh',
                output: data.toString()
            });
            console.log(data.toString());
		}

		apidbDropCreateProc.stdout.on('data', function (data) {
            alertSocket(data);
        });
        apidbDropCreateProc.stderr.on('data', function (data) {
            alertSocket(data);
        });

        apidbDropCreateProc.stdout.on('close', function (code) {
            var apidbInitProc = spawn('sudo', ['-u', 'osm', apidbInitSh]);
            function alertSocket(data) {
            	io.emit('deployments/' + deployment, {
	                controller: 'api-db',
	                method: 'reset',
	                script: 'api-db-init.sh',
	                output: data.toString()
	            });
	            console.log(data.toString());
            }
            apidbInitProc.stdout.on('data', function (data) {
	        	alertSocket(data);
	        });
	        apidbInitProc.stderr.on('data', function (data) {
	        	alertSocket(data);
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
		if (typeof res !== 'undefined') {
			res.status(200).json({
				status: 200,
				deployment: deployment,
				msg: 'Dropping, creating, and initializing new API DB.'
			});
		}
	}

	function populate(req, res, next) {
		var deployment = deployName || req.body.deployment || req.query.deployment || 'undefined';
		var deploymentContentsDir = settings.deploymentsDir + '/' + deployment + '/contents';

		var apidbPopulateProc = spawn('sudo', ['-u', 'osm', apidbPopulateSh, deploymentContentsDir]);
		
		function alertSocket(data) {
			io.emit('deployments/' + deployment, {
                controller: 'api-db',
                method: 'populate',
                script: 'api-db-populate.sh',
                output: data.toString()
            });
            console.log(data.toString());
		}

		apidbPopulateProc.stdout.on('data', function (data) {
            alertSocket(data);
        });
        apidbPopulateProc.stderr.on('data', function (data) {
            alertSocket(data);
        });

        apidbPopulateProc.stdout.on('close', function (code) {
        	if (!deploymentsStatus[deployment]) deploymentsStatus[deployment] = {};
        	if (code === false) {
        		deploymentsStatus[deployment] = {'api-db/populate': 'done'};
        	} else {
        		deploymentsStatus[deployment] = {'api-db/populate': 'error'};
        	}
        	io.emit('deployments/' + deployment, {
        		controller: 'api-db',
        		method: 'populate',
        		close: true,
        		code: code,
        		deployment: deployment,
        		status: deploymentsStatus[deployment]
        	});
        });

        if (typeof res !== 'undefined') {
            res.status(200).json({
                status: 200,
                deployment: deployment,
                msg: 'Populating API DB.'
            });
        }
	}

	function resetAndPopulate(req, res, next) {
		deployName = deployName || req.body.deployment || req.query.deployment || 'undefined';
		reset(null, null, function() {
			populate();
		});
		if (typeof res !== 'undefined') {
			res.status(200).json({
				status: 200,
				deployment: deployName,
				msg: 'Resetting and populating API DB.'
			});
		}
	}

	function backup(req,res,next){
		var backupAPIdb = spawn(apidbBackup, ['osm', '/opt/data/api-db-dumps/']);


		backupAPIdb.stdout.on('data', function (data) {
			console.log(data.toString());
		});

		backupAPIdb.stdout.on('close', function (data) {
			console.log(data.toString());
		});

		backupAPIdb.stderr.on('data', function (data) {
			console.log(data.toString());
		});
	}

	return { reset: reset, populate: populate, resetAndPopulate: resetAndPopulate, backup: backup };
};
