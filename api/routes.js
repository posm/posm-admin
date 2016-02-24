var router = require('express').Router({ mergeParams: true });
var postManifest = require('./controllers/post-manifest');
var fetchHotExport = require('./controllers/fetch-hot-export');


/**
 * Accepts a manifest in a POST and write
 * it to a deployments directory named by the
 * name field.
 */
router.route('/manifest').post(postManifest);


/**
 * You can provide a URL to a HOT Export tar.gz
 * as a GET query parameter
 * or { "url": <url> } in a JSON post.
 * The tar.gz must contain a manifest.json file.
 */
router.route('/fetch-hot-export')
	.get(fetchHotExport)
	.post(fetchHotExport);


module.exports = router;
