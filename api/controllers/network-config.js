"use strict";

var spawn = require("child_process").spawn;

var async = require("async");

var statusUtility = require("../utilities/status");

// TODO these should in the PATH
var changeSSIDSh = __dirname + "/../../scripts/root_change-ssid.sh";
var changeWPASh = __dirname + "/../../scripts/root_change-wpa.sh";
var changeWPAPassphraseSh =
  __dirname + "/../../scripts/root_change-wpa-passphrase.sh";
var changeNetworkModeSh =
  __dirname + "/../../scripts/root_change-network-mode.sh";

function run(cmd, args, errorPrefix, callback) {
  var child = spawn(cmd, args);

  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);

  // capture stderr so it can be included in the resulting error
  var stderr = [];

  child.stderr.on("data", function(chunk) {
    stderr.push(chunk);
  });

  child.on("exit", function(code, signal) {
    if (code === 0) {
      return callback();
    }

    return callback(
      new Error(
        errorPrefix +
          " failed w/ " +
          code +
          ": " +
          Buffer.concat(stderr).toString("utf-8")
      )
    );
  });

  return child;
}

function changeBridgedNetworkMode(bridged, callback) {
  var mode = "captive";

  if (bridged) {
    mode = "bridged";
  }

  console.log("Changing network mode to " + mode);

  return run(
    "sudo",
    [changeNetworkModeSh, mode],
    "Changing network mode",
    callback
  );
}

function changeSSID(ssid, callback) {
  console.log("Changing SSID to " + ssid);
  return run("sudo", [changeSSIDSh, ssid], "Changing SSID", callback);
}

function changeWPA(wpa, callback) {
  var mode = "0";

  if (wpa) {
    mode = "2";
  }

  console.log("Changing WPA mode to " + mode);
  return run("sudo", [changeWPASh, mode], "Changing WPA mode", callback);
}

function changeWPAPassphrase(passphrase, callback) {
  console.log("Changing WPA passphrase to " + passphrase);
  return run(
    "sudo",
    [changeWPAPassphraseSh, passphrase],
    "Changing WPA passphrase",
    callback
  );
}

function sendMessage(io, status) {
    if (io == null) {
      return;
    }

    io.emit("network-config", {
        status: {
            running: true,
            msg: status
        }
    });
}

function markAsDone(io) {
    if (io == null) {
      return;
    }

    io.emit("network-config", {
        status: {
            running: false
        }
    });
}

module.exports = function(io) {
  return function(req, res, next) {
    var tasks = [];

    return statusUtility.getPOSMStatus(function(err, status) {
      if (err) {
        return next(err);
      }

      if (
        req.body.bridged != null &&
        req.body.bridged !== status.network.bridged
      ) {
        tasks.push(
          async.asyncify(sendMessage.bind(null, io, "Setting bridge status...")),
          changeBridgedNetworkMode.bind(null, req.body.bridged)
        );
      }

      if (
        req.body.wifi &&
        req.body.wifi.ssid != null &&
        req.body.wifi.ssid !== status.network.wifi.ssid
      ) {
        tasks.push(
          async.asyncify(sendMessage.bind(null, io, "Updating SSID...")),
          changeSSID.bind(null, req.body.wifi.ssid)
        );
      }

      if (
        req.body.wifi &&
        req.body.wifi.wpa != null &&
        req.body.wifi.wpa !== status.network.wifi.wpa
      ) {
        tasks.push(
          async.asyncify(sendMessage.bind(null, io, "Setting WPA mode...")),
          changeWPA.bind(null, req.body.wifi.wpa)
        );
      }

      if (
        req.body.wifi &&
        req.body.wifi.wpa_passphrase != null &&
        req.body.wifi.wpa_passphrase !== status.network.wifi.wpa_passphrase
      ) {
        tasks.push(
          async.asyncify(sendMessage.bind(null, io, "Setting WPA passphrase...")),
          changeWPAPassphrase.bind(null, req.body.wifi.wpa_passphrase)
        );
      }

      // run tasks in series so they don't conflict
      return async.series(tasks, function(err) {
        markAsDone(io);

        if (err) {
          return next(err);
        }

        return res.sendStatus(200);
      });
    });
  };
};
