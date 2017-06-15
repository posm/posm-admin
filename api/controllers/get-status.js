var fs = require("fs");

var statusUtility = require('../utilities/status');

module.exports = function (io) {
    return function (req, res, next) {
        return statusUtility.getPOSMStatus(function(err, status) {
            if (err) {
                return next(err);
            }

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
