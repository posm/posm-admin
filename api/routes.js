var router = require('express').Router({ mergeParams: true });
var postManifest = require('./controllers/post-manifest');
var fetchHotExport = require('./controllers/fetch-hot-export');
var xls2xform = require('./controllers/xls2xform');

/**
 * Takes a socket io instance so we have a hold of it.
 * Returns the router.
 *
 * @param io - socket.io instance
 * @returns router - the router
 */
module.exports = function(io) {

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
        .get(fetchHotExport(io, true))
        .post(fetchHotExport(io, true));

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
        .get(fetchHotExport(io))
        .post(fetchHotExport(io));

    /**
     * Converts xlsx files in a deployment to an XForm.
     * Puts both files in the forms directory in
     * OpenMapKit Server.
     */
    router.route('/xls2xform')
        .get(xls2xform(io))
        .post(xls2xform(io));

	return router;
};
