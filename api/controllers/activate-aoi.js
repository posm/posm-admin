var statusUtility = require('../utilities/status');

/**
 * Activate specified aoi
 *
 */
module.exports = function (req, res, next) {
    console.log('==> activate-aoi.js');
    // must have name
    if (typeof req.body.aoi_name !== 'string') {
        res.status(400).json({
            status: 400,
            msg: 'Unable to activate aoi'
        });
        return;
    }

    if(req.body.aoi_name){
        statusUtility.update('','', {activeAOI: req.body.aoi_name});
    }
};

