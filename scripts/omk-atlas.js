#!/usr/bin/env node

var DEPLOYMENTS_DIR = '/opt/data/deployments';
var SCRIPTS_DIR = '/opt/admin/posm-admin/scripts/';

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
 * ./omk-atlas.js
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
            var jsonFileName = dir + '/manifest.json';
            var json = JSON.stringify(atlasGeoJSON, null, 2);
            fs.writeFile(jsonFileName, json, function (err) {
                if (err) {
                    console.error('omk-atlas.js: Had trouble writing manifest.json. ' + dir);
                    return;
                }

                extractOsmXml();
                renderPosmCartoMBTiles();
                copyAOIMBTilesToAtlasMBTiles();

            });

        });
    } catch (err) {
        console.error('omk-atlas.js: Unable to read Field Papers Atlas GeoJSON and write manifest.json.');
        console.error(JSON.stringify(err, null, 2));
    }
};

function extractOsmXml() {

}

function renderPosmCartoMBTiles() {

}

function copyAOIMBTilesToAtlasMBTiles() {

}
