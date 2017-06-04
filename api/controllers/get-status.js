var fs = require("fs");

var statusUtility = require('../utilities/status');

var POSM_CONFIG = process.env.POSM_CONFIG || "/etc/posm.json";

module.exports = function (io) {
    return function (req, res, next) {
        return fs.readFile(POSM_CONFIG, "utf-8", function(err, data) {
            if (err) {
                return next(err);
            }

            var config;
            try {
                config = JSON.parse(data);
            } catch (err) {
                return next(err);
            }

            var status = statusUtility.getStatus();

            status.network = {
                wan: {
                    iface: config.posm_wan_netif
                },
                lan: {
                    iface: config.posm_lan_netif,
                    ip: config.posm_lan_ip
                },
                wlan: {
                    iface: config.posm_wlan_netif,
                    ip: config.posm_wlan_ip
                },
                wifi: {
                    ssid: config.posm_ssid,
                    wpa_passphrase: config.posm_wpa_passphrase,
                    channel: config.posm_wifi_channel,
                    "80211n": !!config.posm_wifi_80211n,
                    wpa: config.posm_wifi_wpa === 2,
                },
                hostname: config.posm_hostname,
                fqdn: config.posm_fqdn
            };

            status.osm = {
                fqdn: config.osm_fqdn
            };

            if (req.query.deployment) {
                var deployment = status[req.query.deployment];
                if (typeof deployment === 'object' && deployment !== null) {
                    res.status(200).json(deployment);
                } else {
                    res.status(404).json({
                        status: 404,
                        msg: 'Sorry, we could not find the status of the deployment you are looking for.'
                    })
                }
            } else {
                // No deployment query parameter - give status of everything.
                res.status(200).json(status);
            }
        });
    };
};
