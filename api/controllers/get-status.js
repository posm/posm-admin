var statusUtility = require('../utilities/status');

module.exports = function (io) {
    return function (req, res, next) {
        if (req.query.deployment) {
            var status = statusUtility.getStatus();
            var deployment = status[req.query.deployment];
            if (typeof deployment === 'object' && deployment !== null) {
                res.status(200).json(deployment);
            } else {
                res.status(404).json({
                    status: 404,
                    msg: 'Sorry, we could not find the status of the deployment you are looking for.'
                })
            }
        }
        // No deployment query parameter - give status of everything.
        else {
            var status = statusUtility.getStatus();
            res.status(200).json(status);
        }
    };
};
