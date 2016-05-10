var request = require('request');
var atlasDeployJs = require(__dirname + '/../../scripts/omk-atlas.js');
var fs = require('fs');
var statusUtility = require('../utilities/status');
var path = require('path');
var AOI_DIR = '/opt/data/aoi';
var socket;

/**
 *
 * The overall process, as well as each individual script has an status object
 * An error resulting from an individual script will change the status of the overall process
 *
 * @param io
 * @param status
 * @returns {{init: init}}
 */

module.exports = function (io) {

    // register status
    statusUtility.registerProcess('atlas-deploy', ['extractOSMxml', 'renderMBTiles', 'copyMBTiles']);

    return function (req, res, next) {

        // GeoJSON is posted in web-hook post from Field Papers
        if (typeof req.body.atlas === 'object' 
                && typeof req.body.atlas.features === 'object' 
                && req.body.atlas.features.length > 0) {
            
            deployAtlas(req.body.atlas);

            res.status(201).json({
                status: 201,
                msg: 'Taking the bounds Field Papers Atlas GeoJSON and creating an OpenMapKit deployment.',
                webhook: true
            });
            return;
        }

        /**
         * Otherwise, a URL to the Field Papers GeoJSON is provided as the body of a JSON POST
         * or from a GET query parameter.
         */
        
        // We get the url from a url query param or a url field in a JSON POST.
        var url = req.body.url || req.query.url;

        //reset status
        statusUtility.resetProcess('atlas-deploy', ['extractOSMxml', 'renderMBTiles', 'copyMBTiles']);

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

        /**
         *
         * get geojson from URL
         * feed to buildOmkAtlas function in omk-atlas.js
         *
         */
        try {
            request(url, function (err, res, body) {
                if (err) {
                    statusUtility.update('atlas-deploy', '', {error:true, msg: err});
                    console.error(err);
                    return;
                }

                statusUtility.update('atlas-deploy', '', {fpGeoJsonUrl:url});
                deployAtlas(JSON.parse(body));
            });
        } catch (err) {
            // TODO status error
            statusUtility.update('atlas-deploy', '', {error:true});
            alertSocket('unable to fetch geojson: ' + err);
            console.log('unable to fetch geojson: ' + err);
        }
    }
};

function deployAtlas(fieldPapersAtlasGeoJson) {
    var activeAOI = statusUtility.getActiveAOI();
    atlasDeployJs(fieldPapersAtlasGeoJson, path.join(AOI_DIR, activeAOI), alertSocket);
}

function alertSocket(data) {
    var status = statusUtility.getStatus('atlas-deploy');
    io.emit('atlas-deploy', {
        controller: 'atlas-deploy',
        script: 'omk-atlas.js',
        output: data.toString(),
        status: status
    });
    console.log(data.toString());
}
