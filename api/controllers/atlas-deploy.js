var request = require('request');
var atlasDeployJs = require(__dirname + '/../../scripts/omk-atlas.js');

module.exports = function (io, deploymentsStatus, fullDeploy) {
    return function (req, res, next) {
        // We get the url from a url query param or a url field in a JSON POST.
        var url = req.body.url || req.query.url;
        if (typeof url !== 'string' && typeof res !== 'undefined') {
            res.status(400).json({
                status: 400,
                msg: 'You must provide a URL to a hot export tar.gz. This can be a url query parameter or url string in a JSON POST.'
            });
            return;
        }

        function alertSocket(data) {
            io.emit('atlas-deploy', {
                controller: 'atlas-deploy',
                script: 'omk-atlas.js',
                output: data.toString()
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
                    console.error(err);
                    return;
                }
                var atlasGeoJSON = JSON.parse(body);
                atlasDeployJs(atlasGeoJSON, '/opt/data/aoi/huaquillas', alertSocket);
            });
        } catch (err) {
            console.log('unable to fetch geojson: ' + err)
        }


        res.status(201).json({
            status: 201,
            msg: 'Doing a full deployment starting with fetchign a HOT Export tar.gz.',
            remoteUrl: url
        });
    };

};
