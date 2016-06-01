var request = require('request');
var spawn = require('child_process').spawn;
var fs = require('fs');
var statusUtility = require('../utilities/status');
var path = require('path');
var socket;
var STATUS_FILE = '/opt/data/deployments/status.json';

/**
 *
 * The overall process, as well as each individual script has an status object
 * An error resulting from an individual script will change the status of the overall process
 *
 * @param io
 * @param status
 * @returns {{init: init}}
 */

module.exports = function (io) {


    return function (req, res, next) {

        // Run backup data script
        var removeStatusFileProc = spawn('rm', [STATUS_FILE]);

        removeStatusFileProc.stdout.on('data', function (data) {
            console.log(data);
        });

        removeStatusFileProc.stdout.on('close', function (data) {
            statusUtility.init(function(){
                // send response
                statusUtility.registerProcess('aoi-deploy');
                statusUtility.registerProcess('atlas-deploy', ['extractOSMxml', 'renderMBTiles', 'copyMBTiles']);
                statusUtility.registerProcess('backup-data');
                statusUtility.registerProcess('network-config', ['network-mode', 'ssid', 'wpa-passphrase', 'wpa']);
                statusUtility.registerProcess('render-db', ['api2pbf', 'pbf2render', 'restartTessera']);

                res.status(201).json({
                    status: 201,
                    msg: 'Status reset complete. Please refresh page.'
                });
            });
        });

        removeStatusFileProc.stderr.on('data', function (data) {
            console.log(data);
        });

    };
};
