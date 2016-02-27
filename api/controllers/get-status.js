module.exports = function (io, deploymentsStatus) {
    return function (req, res, next) {
        if (req.query.deployment) {
            var deployment = deploymentsStatus[req.query.deployment];
            if (typeof deployment === 'object' && query !== null) {
                req.status(200).json(deployment);
            } else {
                req.status(404).json({
                    status: 404,
                    msg: 'Sorry, we could not find the status of the deployment you are looking for.'
                })
            }
        }
        // No deployment query parameter - give status of everything.
        else {
            res.status(200).json(deploymentsStatus);
        }
    };
};
