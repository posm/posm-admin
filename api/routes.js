var router = require('express').Router({ mergeParams: true });
var postManifest = require('./controllers/post-manifest');

// Will accept a manifest in a POST and write
// it to a deployments directory named by the
// name field.
router.route('/manifest').post(postManifest);


module.exports = router;
