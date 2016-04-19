var request = require('request');
var atlasDeployJs = require(__dirname + '/../../scripts/omk-atlas.js');

module.exports = function (io, status) {

    // register status
    if (!status['atlas-deploy']) {
        status['atlas-deploy'] = {
            complete: false,
            initialized: false,
            error: false,
            msg: ""
        };

        status['atlas-deploy'].extractOSMxml = {};
        status['atlas-deploy'].renderMBTiles = {};
        status['atlas-deploy'].copyMBTiles = {};

    }

    function init (req, res, next) {
        // We get the url from a url query param or a url field in a JSON POST.
        var url = req.body.url || req.query.url;

        //reset status
        status['atlas-deploy'] = {
            complete: false,
            initialized: false,
            msg: ""
        };
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
                exportUrl: url,
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
                var atlasGeoJSON = JSON.parse(body);
                //TODO get list of
                atlasDeployJs(atlasGeoJSON, '/opt/data/aoi/huaquillas', alertSocket, status['atlas-deploy']);
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
