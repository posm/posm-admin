#!/usr/bin/env node

var DEPLOYMENTS_DIR = '/opt/data/deployments';
var OSM_OMK_OSM_SH = __dirname + '/osm_omk-osm.sh';

var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;
var argv = require('minimist')(process.argv.slice(2));
var request = require('request');
var mkdirp = require('mkdirp');

/**
 * The url argument should be the url of the map.geojson
 * for a given Field Papers atlas.
 *
 * /opt/admin/posm-admin/scripts/omk-atlas.js http://posm.local/fp/atlases/5b3s1bbl.geojson
 */
if (typeof argv === 'object') {
    var fpUrl = argv._[0] || argv.u || argv.url;
    if (typeof fpUrl === 'string') {
        request(fpUrl, function (err, res, body) {
            if (err) {
                console.error(err);
                return;
            }
            var atlasGeoJSON = JSON.parse(body);
            buildOmkAtlas(atlasGeoJSON);
        });
    }
}

var buildOmkAtlas = module.exports = function (atlasGeoJSON) {
    try {
        var atlasUrl = atlasGeoJSON.features[0].properties.url;
        var urlParts = atlasUrl.split('/');
        var slug = urlParts[urlParts.length - 1];
        var dir = DEPLOYMENTS_DIR + '/' + slug;
        mkdirp(dir, function (err) {
            if (err) {
                console.error('omk-atlas.js: Had trouble making the deployments dir: ' + dir);
                return;
            }
            console.log('omk-atlas.js: Sucessfully created deployment dir: ' + dir);

            // Write manifest
            var jsonFileName = dir + '/fp.geojson';
            var json = JSON.stringify(atlasGeoJSON, null, 2);
            fs.writeFile(jsonFileName, json, function (err) {
                if (err) {
                    console.error('omk-atlas.js: Had trouble writing fp.geojson. ' + dir);
                    return;
                }

                extractOsmXml(dir, atlasGeoJSON);
                renderPosmCartoMBTiles(dir, atlasGeoJSON);
                copyAOIMBTilesToAtlasMBTiles(dir, atlasGeoJSON);

            });

        });
    } catch (err) {
        console.error('omk-atlas.js: Unable to read Field Papers Atlas GeoJSON and write manifest.json.');
        console.error(JSON.stringify(err, null, 2));
    }
};

function extractOsmXml(dir, atlasGeoJSON) {
    var features = atlasGeoJSON.features;

    // get the title for file names
    var title = features[0].properties.title;

    // skip second feature - it is the index page

    // the rest of the features are pages
    for (var i = 2, len = features.length; i < len; i++) {
        var f = features[i];

        // osm file name
        var fileName = title + ' ' + f.properties.page_number + '.osm';
        var filePath = dir + '/' + fileName;

        // bbox
        var left = f.geometry.coordinates[0][0][0];
        var bottom = f.geometry.coordinates[0][0][1];
        var right = f.geometry.coordinates[0][3][0];
        var top = f.geometry.coordinates[0][1][1];

        // create osm xml for bbox
        var omkProc = spawn('sudo', ['-u', 'osm', OSM_OMK_OSM_SH,
                                                    filePath,
                                                    left,
                                                    bottom,
                                                    right,
                                                    top]);

        omkProc.stdout.pipe(process.stdout);
        omkProc.stderr.pipe(process.stderr);

    }
}

function renderPosmCartoMBTiles(dir, atlasGeoJSON) {

}

function copyAOIMBTilesToAtlasMBTiles(dir, atlasGeoJSON) {

}
