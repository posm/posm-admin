var router = require('express').Router({ mergeParams: true });
var getStatus = require('./controllers/get-status');
var postManifest = require('./controllers/post-manifest');
var fetchHotExport = require('./controllers/fetch-hot-export');
var xls2xform = require('./controllers/xls2xform');
var apidb = require('./controllers/api-db');
var renderdb = require('./controllers/render-db');

/**
 * Takes a socket io instance so we have a hold of it.
 * Returns the router.
 *
 * @param io - socket.io instance
 * @param status - status of the deployments & operations
 * @returns router - the router
 */
module.exports = function(io, status) {

	/**
	 * End point to query the status of a deployment
	 * or get the status of all of the deployments.
	 */
	router.route('/status').get(getStatus(io, status));

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
        .get(fetchHotExport(io, status, true))
        .post(fetchHotExport(io, status, true));

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
        .get(fetchHotExport(io, status))
        .post(fetchHotExport(io, status));

    /**
     * Converts xlsx files in a deployment to an XForm.
     * Puts both files in the forms directory in
     * OpenMapKit Server.
     */
    router.route('/xls2xform')
        .get(xls2xform(io, status))
        .post(xls2xform(io, status));

    router.route('/api-db/reset')
        .get(apidb(io, status).reset)
        .post(apidb(io, status).reset);

    router.route('/api-db/populate')
        .get(apidb(io, status).populate)
        .post(apidb(io, status).populate);

    router.route('/api-db/reset-and-populate')
        .get(apidb(io, status).resetAndPopulate)
        .post(apidb(io, status).resetAndPopulate);

	router.route('/render-db/api2pbf')
		.get(renderdb(io, status).api2pbf)
        .post(renderdb(io, status).api2pbf);

	router.route('/render-db/pbf2render')
        .get(renderdb(io, status).pbf2render)
        .post(renderdb(io, status).pbf2render);

	return router;
};
