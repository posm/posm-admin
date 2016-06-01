var spawn = require('child_process').spawn;
var fs = require('fs');
var settings = require('../../settings');
var changeSSIDSh = __dirname + '/../../scripts/root_change-ssid.sh';
var changeWPASh = __dirname + '/../../scripts/root_change-wpa.sh';
var changeWPApPassphraseSh = __dirname + '/../../scripts/root_change-wpa-passphrase.sh';
var changeNetworkModeSh = __dirname + '/../../scripts/root_change-network-mode.sh';

var statusUtility = require('../utilities/status');

module.exports = function (io) {

    // register status
    statusUtility.registerProcess('network-config', ['network-mode', 'ssid', 'wpa-passphrase', 'wpa']);

    return function (req, res, next) {

        if (req.params.config === 'ssid') {
            changeSSID();
        } else if (req.params.config === 'network-mode') {
            changeNetworkMode();
        } else if (req.params.config === 'wpa') {
            changeWPA();
        } else if (req.params.config === 'wpa-passphrase') {
            changeWPAPassphrase()
        } else {
            res.status(400).json({
                status: 400,
                msg: 'You must provide one of the following config params (ie: /network-config/ssid): network-mode, ssid, wpa-passphrase, wpa'
            });
        }

        function changeNetworkMode() {
            if (typeof req.query.value !== "string") {
                res.status(400).json({
                    status: 400,
                    msg: 'You must provide a value query param in the request URL'
                });
                return;
            } else {
                res.status(201).json({
                    status: 201,
                    msg: 'Changing Network Mode..'
                });
            }

            //reset status
            statusUtility.resetChildProcess('network-config', 'network-mode');
            var mode = req.query.value;
            var changeNetworkModeProc = spawn('sudo', [changeNetworkModeSh, mode]);

            function alertSocket(data) {
                var status = statusUtility.getStatus('network-config');

                io.emit('network-config', {
                    controller: 'network-config',
                    method: 'network-mode',
                    script: 'root_change-network-mode.sh',
                    output: data.toString(),
                    status: status
                });
                console.log(data.toString());
            }

            changeNetworkModeProc.stdout.on('data', function (data) {
                statusUtility.update('network-config', '', {initialized: true, error: false, msg: 'Changing Network Mode.'});
                statusUtility.update('network-config', 'network-mode', {initialized: true, error: false, value: mode});
                alertSocket(data);
            });

            changeNetworkModeProc.stdout.on('close', function (data) {
                statusUtility.update('network-config', 'network-mode', {complete: true, error: false, value: mode, initialized: false});
                statusUtility.update('network-config', '', {error: false, initialized: false});
                alertSocket(data);
            });

            changeNetworkModeProc.stderr.on('data', function (data) {
                var error = (typeof data == 'object') ? data.toString() : data;
                statusUtility.update('network-config', 'network-mode', {error: true, msg: error});
                statusUtility.update('network-config', '', {error: true});
                alertSocket(error);
            });


        }

        function changeSSID() {

            if (typeof req.query.value !== "string") {
                res.status(400).json({
                    status: 400,
                    msg: 'You must provide a value query param in the request URL'
                });
                return;
            } else {
                res.status(201).json({
                    status: 201,
                    msg: 'Changing SSID..'
                });
            }

            //reset status
            statusUtility.resetChildProcess('network-config', 'ssid');
            var ssid = req.query.value.toLowerCase();
            var changeSSIDProc = spawn('sudo', [changeSSIDSh, ssid]);

            function alertSocket(data) {
                var status = statusUtility.getStatus('network-config');

                io.emit('network-config', {
                    controller: 'network-config',
                    method: 'ssid',
                    script: 'root_change-ssid.sh',
                    output: data.toString(),
                    status: status
                });
                console.log(data.toString());
            }

            changeSSIDProc.stdout.on('data', function (data) {
                statusUtility.update('network-config', '', {initialized: true, error: false, msg: 'Changing SSID'});
                statusUtility.update('network-config', 'ssid', {initialized: true, error: false, value: ssid});
                alertSocket(data);
            });

            changeSSIDProc.stdout.on('close', function (data) {
                statusUtility.update('network-config', 'ssid', {complete: true, error: false, value: ssid, initialized: false});
                statusUtility.update('network-config', '', {error: false, initialized: false});
                alertSocket(data);
            });

            changeSSIDProc.stderr.on('data', function (data) {
                var error = (typeof data == 'object') ? data.toString() : data;
                statusUtility.update('network-config', 'ssid', {error: true, msg: error});
                statusUtility.update('network-config', '', {error: true});
                alertSocket(error);
            });

        }

        function changeWPAPassphrase() {

            if (typeof req.query.value !== "string") {
                res.status(400).json({
                    status: 400,
                    msg: 'You must provide a value query param in the request URL'
                });
                return;
            } else {
                res.status(201).json({
                    status: 201,
                    msg: 'Changing WPA Passphrase..'
                });
            }

            //reset status
            statusUtility.resetChildProcess('network-config', 'wpa-passphrase');
            var passphrase = req.query.value;
            var changeNetworkModeProc = spawn('sudo', [changeWPApPassphraseSh, passphrase]);

            function alertSocket(data) {
                var status = statusUtility.getStatus('network-config');

                io.emit('network-config', {
                    controller: 'network-config',
                    method: 'wpa-passphrase',
                    script: 'root_change-wpa-passphrase.sh',
                    output: data.toString(),
                    status: status
                });
                console.log(data.toString());
            }

            changeNetworkModeProc.stdout.on('data', function (data) {
                statusUtility.update('network-config', '', {initialized: true, error: false, msg: 'Changing WPA Passphrase'});
                statusUtility.update('network-config', 'wpa-passphrase', {initialized: true, error: false, value: passphrase});
                alertSocket(data);
            });

            changeNetworkModeProc.stdout.on('close', function (data) {
                statusUtility.update('network-config', 'wpa-passphrase', {complete: true, error: false, value: passphrase, initialized: false});
                statusUtility.update('network-config', '', {error: false, initialized: false});
                alertSocket(data);
            });

            changeNetworkModeProc.stderr.on('data', function (data) {
                var error = (typeof data == 'object') ? data.toString() : data;
                statusUtility.update('network-config', 'wpa-passphrase', {error: true, msg: error});
                statusUtility.update('network-config', '', {error: true});
                alertSocket(error);
            });

        }

        function changeWPA() {

            if (typeof req.query.value !== "string") {
                res.status(400).json({
                    status: 400,
                    msg: 'You must provide a value query param in the request URL'
                });
                return;
            } else {
                res.status(201).json({
                    status: 201,
                    msg: 'Changing the WPA password..'
                });
            }

            //reset status
            statusUtility.resetChildProcess('network-config', 'wpa');
            var wpa = req.query.value;
            var changeNetworkModeProc = spawn('sudo', [changeWPASh, wpa]);

            function alertSocket(data) {
                var status = statusUtility.getStatus('network-config');

                io.emit('network-config', {
                    controller: 'network-config',
                    method: 'wpa',
                    script: 'root_change-wpa.sh',
                    output: data.toString(),
                    status: status
                });
                console.log(data.toString());
            }

            changeNetworkModeProc.stdout.on('data', function (data) {
                statusUtility.update('network-config', '', {initialized: true, error: false, msg: 'Changing WPA'});
                statusUtility.update('network-config', 'wpa', {initialized: true, error: false, value: wpa});
                alertSocket(data);
            });

            changeNetworkModeProc.stdout.on('close', function (data) {
                var status = statusUtility.getStatus('network-config');
                // check for missing wpa value error
                if (!status['wpa'].error) {
                    statusUtility.update('network-config', 'wpa', {complete: true, error: false, value: wpa, initialized: false});
                    statusUtility.update('network-config', '', {error: false, initialized: false});
                }
                alertSocket(data);
            });

            changeNetworkModeProc.stderr.on('data', function (data) {
                var error = (typeof data == 'object') ? data.toString() : data;
                statusUtility.update('network-config', 'wpa', {error: true, msg: error});
                statusUtility.update('network-config', '', {error: true});
                alertSocket(error);
            });
        }

    }
};
