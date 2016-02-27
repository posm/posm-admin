var router = require('express').Router({ mergeParams: true });
var getStatus = require('./controllers/get-status');
var postManifest = require('./controllers/post-manifest');
var fetchHotExport = require('./controllers/fetch-hot-export');
var xls2xform = require('./controllers/xls2xform');

/**
 * Takes a socket io instance so we have a hold of it.
 * Returns the router.
 *
 * @param io - socket.io instance
 * @param deploymentsStatus - status of the deployments
 * @returns router - the router
 */
module.exports = function(io, deploymentsStatus) {

	/**
	 * End point to query the status of a deployment
	 * or get the status of all of the deployments.
	 */
	router.route('/status').get(getStatus(io, deploymentsStatus));

	/**
	 * Accepts a manifest in a POST and write
	 * it to a deployments directory named by the
	 * name field.
	 */
	router.route('/manifest').post(postManifest);

    /**
     * Similar to `/fetch-hot-export`, except that the
     * complete deployment process is initiated from this
     * single API call.
     */
    router.route('/full-deploy')
        .get(fetchHotExport(io, deploymentsStatus, true))
        .post(fetchHotExport(io, deploymentsStatus, true));

    /**
     * You can provide a URL to a HOT Export tar.gz
     * as a GET query parameter
     * or { "url": <url> } in a JSON post.
     * The tar.gz must contain a manifest.json file.
     *
     * This endpoint get's the HOT Export into the
     * deployments directory and stops there.
     */
    router.route('/fetch-hot-export')
        .get(fetchHotExport(io, deploymentsStatus))
        .post(fetchHotExport(io, deploymentsStatus));

    /**
     * Converts xlsx files in a deployment to an XForm.
     * Puts both files in the forms directory in
     * OpenMapKit Server.
     */
    router.route('/xls2xform')
        .get(xls2xform(io, deploymentsStatus))
        .post(xls2xform(io, deploymentsStatus));

	return router;
};
