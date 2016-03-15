#!/usr/bin/env node

var DEPLOYMENTS_DIR = '/opt/data/deployments';
var OSM_OMK_OSM_SH = __dirname + '/osm_omk-osm.sh';
var GIS_OMK_POSM_MBTILES_SH = __dirname + '/gis_omk-posm-mbtiles.sh';
var GIS_OMK_AOI_MBTILES_SH = __dirname + '/gis_omk-aoi-mbtiles.sh';

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
 * args: Field Papers map.geojson, AOI Dir (optional)
 *
 * Example:
 *
 * /opt/admin/posm-admin/scripts/omk-atlas.js http://posm.local/fp/atlases/5b3s1bbl.geojson /opt/data/aoi/huaquillas
 *
 */
if (typeof argv === 'object') {
    var fpUrl = argv._[0] || argv.u || argv.url;
    var aoiDir = argv._[1] || argv.a || argv.aoiDir;
    if (typeof fpUrl === 'string') {
        request(fpUrl, function (err, res, body) {
            if (err) {
                console.error(err);
                return;
            }
            var atlasGeoJSON = JSON.parse(body);
            buildOmkAtlas(atlasGeoJSON, aoiDir);
        });
    }
}

var buildOmkAtlas = module.exports = function (atlasGeoJSON, aoiDir) {
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

                //extractOsmXml(dir, atlasGeoJSON);
                //renderPosmCartoMBTiles(dir, atlasGeoJSON);
                if (typeof aoiDir === 'string') {
                    copyAOIMBTilesToAtlasMBTiles(aoiDir, dir, atlasGeoJSON);
                }

            });

        });
    } catch (err) {
        console.error('omk-atlas.js: Unable to read Field Papers Atlas GeoJSON and write manifest.json.');
        console.error(JSON.stringify(err, null, 2));
    }
};

function extractOsmXml(dir, atlasGeoJSON) {
    var features = atlasGeoJSON.features;

    // get the title from the atlas feature for file names
    var title = features[0].properties.title;

    // skip second feature - it is the index page

    // the rest of the features are pages
    for (var i = 2, len = features.length; i < len; i++) {
        var f = features[i];

        // osm file name without extension (added by bash script)
        var fileName = title + ' ' + f.properties.page_number;
        var filePath = dir + '/' + fileName;

        var bbox = extractBBox(f);

        // create osm xml for bbox
        var posmMBTilesProc = spawn('sudo', ['-u', 'osm', OSM_OMK_OSM_SH,
                                                            filePath,
                                                            bbox.left,
                                                            bbox.bottom,
                                                            bbox.right,
                                                            bbox.top]);

        posmMBTilesProc.stdout.pipe(process.stdout);
        posmMBTilesProc.stderr.pipe(process.stderr);

    }
}

function renderPosmCartoMBTiles(dir, atlasGeoJSON) {
    var features = atlasGeoJSON.features;

    // get the file name from the title of the atlas
    var fileName = features[0].properties.title + ' POSM.mbtiles';
    var filePath = dir + '/' + fileName;

    // get the bbox from the index page
    var bbox = extractBBox(features[1]);

    // create MBTiles for bbox of atlas
    var omkMBTilesProc = spawn('sudo', ['-u', 'gis', GIS_OMK_POSM_MBTILES_SH,
                                                            filePath,
                                                            bbox.left,
                                                            bbox.bottom,
                                                            bbox.right,
                                                            bbox.top]);

    omkMBTilesProc.stdout.pipe(process.stdout);
    omkMBTilesProc.stderr.pipe(process.stderr);

}

function copyAOIMBTilesToAtlasMBTiles(aoiDir, dir, atlasGeoJSON) {
    var features = atlasGeoJSON.features;

    // file path (gets appended with .mbtiles)
    var fileName = features[0].properties.title;
    var filePath = dir + '/' + fileName;

    // get the bbox from the index page
    var bbox = extractBBox(features[1]);

    // create MBTiles for bbox of atlas
    var omkMBTilesProc = spawn(GIS_OMK_AOI_MBTILES_SH, [aoiDir,
                                                          filePath,
                                                          bbox.left,
                                                          bbox.bottom,
                                                          bbox.right,
                                                          bbox.top]);

    omkMBTilesProc.stdout.pipe(process.stdout);
    omkMBTilesProc.stderr.pipe(process.stderr);
}

function extractBBox(f) {
    return {
        left: f.geometry.coordinates[0][0][0],
        bottom: f.geometry.coordinates[0][0][1],
        right: f.geometry.coordinates[0][3][0],
        top: f.geometry.coordinates[0][1][1]
    };
}