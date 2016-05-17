var request = require('request');
var spawn = require('child_process').spawn;
var fs = require('fs');
var statusUtility = require('../utilities/status');
var path = require('path');
var socket;

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

    // register status
    statusUtility.registerProcess('backup-data', ['backup-api-db']);

    return function (req, res, next) {

        // Run backup data script
        var backupOsmAPIProc = spawn('/opt/admin/posm-admin/scripts/backup-data.sh');

        backupOsmAPIProc.stdout.on('data', function (data) {
            statusUtility.update('backup-data', '', {initialized: true, error: false, msg: 'Backing up osm api db.'});
            statusUtility.update('backup-data', 'backup-api-db', {initialized: true, error: false});
            alertSocket(data);
        });

        backupOsmAPIProc.stdout.on('close', function (data) {
            statusUtility.update('backup-data', 'backup-api-db', {complete: true, error: false});
            statusUtility.update('backup-data', '', {error: false});
            alertSocket(data);
        });

        backupOsmAPIProc.stderr.on('data', function (data) {
            var error = (typeof data == 'object') ? data.toString() : data;
            statusUtility.update('backup-data', 'backup-api-db', {error: true, msg: error});
            statusUtility.update('backup-data', '', {error: true});
            alertSocket(error);
        });

        res.status(201).json({
            status: 201,
            msg: 'Backing up.....'
        });
    };

    function alertSocket(data) {
        var status = statusUtility.getStatus('backup-data');
        io.emit('backup-data', {
            controller: 'backup-data',
            script: 'backup-data.js',
            output: data.toString(),
            status: status
        });
        console.log(data.toString());
    }

    function getHardDisks() {
        njds.drives(function (err, drives) {
            njds.drivesDetail(drives, function (err, data) {
                    return data;
                }
            );
        });
    }
};
