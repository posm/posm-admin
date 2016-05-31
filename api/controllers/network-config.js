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

        //reset status
        statusUtility.resetProcess('network-config', ['network-mode', 'ssid', 'wpa-passphrase', 'wpa']);

        if(req.params.config === 'ssid'){
            changeSSID();
        } else if (req.params.config === 'network-mode'){
            changeNetworkMode();
        } else if (req.params.config === 'wpa'){
            changeWPA();
        } else if (req.params.config === 'wpa-passphrase'){
            changeWPAPassphrase()
        } else {
            res.status(400).json({
                status: 400,
                msg: 'You must provide one of the following config params (ie: /network-config/ssid): network-mode, ssid, wpa-passphrase, wpa'
            });
        }

        function changeNetworkMode() {
            if(typeof req.body.mode !== "string"){
                res.status(400).json({
                    status: 400,
                    msg: 'You must provide a mode property in the request body'
                });
                return;
            }

            var mode = req.body.mode;
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
                statusUtility.update('network-config', 'network-mode', {complete: true, error: false, value: mode});
                statusUtility.update('network-config', '', {error: false});
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

            if(typeof req.body.ssid !== "string"){
                res.status(400).json({
                    status: 400,
                    msg: 'You must provide a ssid property in the request body'
                });
                return;
            }

            var ssid = req.body.ssid;
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
                statusUtility.update('network-config', '', {initialized: true, error: false, msg: 'Changing SSID', value: ssid});
                statusUtility.update('network-config', 'ssid', {initialized: true, error: false});
                alertSocket(data);
            });

            changeSSIDProc.stdout.on('close', function (data) {
                statusUtility.update('network-config', 'ssid', {complete: true, error: false, value: ssid});
                statusUtility.update('network-config', '', {error: false});
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

            if(typeof req.body.passphrase !== "string"){
                res.status(400).json({
                    status: 400,
                    msg: 'You must provide a passphrase property in the request body'
                });
                return;
            }

            var passphrase = req.body.passphrase;
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
                statusUtility.update('network-config', '', {initialized: true, error: false, msg: 'Changing WPA Passphrase', value: passphrase});
                statusUtility.update('network-config', 'wpa-passphrase', {initialized: true, error: false});
                alertSocket(data);
            });

            changeNetworkModeProc.stdout.on('close', function (data) {
                statusUtility.update('network-config', 'wpa-passphrase', {complete: true, error: false, value: passphrase});
                statusUtility.update('network-config', '', {error: false});
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

            if(typeof req.body.wpa !== "string"){
                res.status(400).json({
                    status: 400,
                    msg: 'You must provide a wpa property in the request body'
                });
                return;
            }

            var wpa = req.body.wpa;
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
                statusUtility.update('network-config', '', {initialized: true, error: false, msg: 'Changing WPA', value: wpa});
                statusUtility.update('network-config', 'wpa', {initialized: true, error: false});
                alertSocket(data);
            });

            changeNetworkModeProc.stdout.on('close', function (data) {
                statusUtility.update('network-config', 'wpa', {complete: true, error: false, value: wpa});
                statusUtility.update('network-config', '', {error: false});
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
