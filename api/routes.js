var router = require('express').Router({ mergeParams: true });
var getStatus = require('./controllers/get-status');
var postManifest = require('./controllers/post-manifest');
var aoiDeploy = require('./controllers/aoi-deploy');
var fetchHotExport = require('./controllers/fetch-hot-export');
var xls2xform = require('./controllers/xls2xform');
var apidb = require('./controllers/api-db');
var renderdb = require('./controllers/render-db');
var atlasDeploy = require('./controllers/atlas-deploy');
var activateAOI = require('./controllers/activate-aoi');

/**
 * Takes a socket io instance so we have a hold of it.
 * Returns the router.
 *
 * @param io - socket.io instance
 * @returns router - the router
 */
module.exports = function(io) {
	/**
	 * Root posm-admin route brings you to the full deploy page.
	 */
	router.route('/').get(function (req, res, next) {
		res.redirect('/posm-admin/pages/deployment/aoi-deploy');
	});

	/**
	 * End point to query the status of a deployment
	 * or get the status of all of the deployments.
	 */
	router.route('/status').get(getStatus(io));

	/**
	 * Accepts an aoi_name in a POST and updates status object
	 */
	router.route('/status/activate-aoi').post(activateAOI);

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
    router.route('/aoi-deploy')
        .get(aoiDeploy(io))
        .post(aoiDeploy(io));

	/**
	 * Execute omk-atlas.js
	 */
	router.route('/atlas-deploy')
		.get(atlasDeploy(io))
		.post(atlasDeploy(io));

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

    router.route('/api-db/reset')
        .get(apidb(io).reset)
        .post(apidb(io).reset);

    router.route('/api-db/populate')
        .get(apidb(io).populate)
        .post(apidb(io).populate);

    router.route('/api-db/reset-and-populate')
        .get(apidb(io).resetAndPopulate)
        .post(apidb(io).resetAndPopulate);

	router.route('/render-db')
		.get(renderdb(io).init)
        .post(renderdb(io).init);

	return router;
};
