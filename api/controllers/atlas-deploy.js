var request = require('request');
var atlasDeployJs = require(__dirname + '/../../scripts/omk-atlas.js');
var fs = require('fs');

/**
 *
 * The overall process, as well as each individual script has an status object
 * An error resulting from an individual script will change the status of the overall process
 *
 * @param io
 * @param status
 * @returns {{init: init}}
 */

module.exports = function (io, status) {

    // register status
    if (!status['atlas-deploy']) {
        status['atlas-deploy'] = {complete: false, initialized: false, error: false, msg: "", fpGeoJsonUrl:""};
        status['atlas-deploy'].extractOSMxml = {};
        status['atlas-deploy'].renderMBTiles = {};
        status['atlas-deploy'].copyMBTiles = {};
    }

    function init (req, res, next) {
        // We get the url from a url query param or a url field in a JSON POST.
        var url = req.body.url || req.query.url;

        //reset status
        status['atlas-deploy'] = {complete: false, initialized: false, msg: "", fpGeoJsonUrl:""};
        status['atlas-deploy'].extractOSMxml = {};
        status['atlas-deploy'].renderMBTiles = {};
        status['atlas-deploy'].copyMBTiles = {};

        if (typeof url !== 'string' && typeof res !== 'undefined') {
            res.status(400).json({
                status: 400,
                msg: 'You must provide a URL to a Field Papers Atlas GeoJSON. This can be a url query parameter or url string in a JSON POST.'
            });
            return;
        } else {
            res.status(201).json({
                status: 201,
                msg: 'Taking the bounds Field Papers Atlas GeoJSON and creating an OpenMapKit deployment.',
                remoteUrl: url
            });
        }

        function alertSocket(data) {
            io.emit('atlas-deploy', {
                controller: 'atlas-deploy',
                script: 'omk-atlas.js',
                output: data.toString(),
                status: status['atlas-deploy']
            });
            console.log(data.toString());
        }

        /**
         *
         * get geojson from URL
         * feed to buildOmkAtlas function in omk-atlas.js
         *
         */
        try {
            request(url, function (err, res, body) {
                if (err) {
                    //TODO status error
                    console.error(err);
                    return;
                }
                status['atlas-deploy'].fpGeoJsonUrl = url;
                var atlasGeoJSON = JSON.parse(body);
                //TODO get list of aoi's and deploy atlas for each?
                var aois = fs.readdirSync('/opt/data/aoi');
                aois.forEach(function(aoiName,i) {
                    atlasDeployJs(atlasGeoJSON, '/opt/data/aoi/' + aoiName, alertSocket, status['atlas-deploy']);
                });
            });
        } catch (err) {
            // TODO status error
            status['atlas-deploy'].error = true;
            alertSocket('unable to fetch geojson: ' + err);
            console.log('unable to fetch geojson: ' + err);
        }
    }

    return {init: init};
};
