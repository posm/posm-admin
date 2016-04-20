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
 * Cerca del Hotel
 * /opt/admin/posm-admin/scripts/omk-atlas.js -a /opt/data/aoi/huaquillas -u http://posm.local/fp/atlases/k5iic7si.geojson
 *
 * Choferes Sportman
 * /opt/admin/posm-admin/scripts/omk-atlas.js -a /opt/data/aoi/huaquillas -u http://posm.local/fp/atlases/3bun4nml.geojson
 *
 * Brisas del Sur
 * /opt/admin/posm-admin/scripts/omk-atlas.js -a /opt/data/aoi/huaquillas -u http://posm.local/fp/atlases/5f06he1i.geojson
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

var buildOmkAtlas = module.exports = function (atlasGeoJSON, aoiDir, socket, status) {
    try {
        var atlasUrl = atlasGeoJSON.features[0].properties.url;
        var urlParts = atlasUrl.split('/');
        var slug = urlParts[urlParts.length - 1];
        var dir = DEPLOYMENTS_DIR + '/' + slug;
        if(status) {
            status.msg = 'Creating deployment dir: ' + dir;
        }
        mkdirp(dir, function (err) {
            if (err) {
                console.error(socket('omk-atlas.js: Had trouble making the deployments dir: ' + dir));
                return;
            }
            if(status) status.initialized = true;
            console.log('omk-atlas.js: Successfully created deployment dir: ' + dir);

            fs.chmod(dir, parseInt('0777', 8), function () {
                // Write manifest
                var jsonFileName = dir + '/fp.geojson';
                var json = JSON.stringify(atlasGeoJSON, null, 2);
                fs.writeFile(jsonFileName, json, function (err) {
                    if (err) {
                        status.error = true;
                        socket('omk-atlas.js: Had trouble writing fp.geojson. ' + dir);
                        console.error('omk-atlas.js: Had trouble writing fp.geojson. ' + dir);
                        return;
                    }
                    extractOsmXml(dir, atlasGeoJSON,socket,status);
                    renderPosmCartoMBTiles(dir, atlasGeoJSON,socket,status);
                    if (typeof aoiDir === 'string') {
                        copyAOIMBTilesToAtlasMBTiles(aoiDir, dir, atlasGeoJSON,socket,status);
                    }
                });

                // Create manifest.json
                // We don't have to wait on getting a manifest.json...
                var properties = atlasGeoJSON.features[0].properties;
                var urlArr = properties.url.split('/');
                var slug = urlArr[urlArr.length - 1];
                var manifest = {
                    title: properties.title,
                    name: slug,
                    description: properties.description
                };
                fs.writeFile(dir + '/manifest.json', JSON.stringify(manifest, null, 2), function (err) {
                    if (err) {
                        if(socket) {
                            status.error = true;
                            socket('omk-atlas.js: Had trouble writing manifest.json. ' + dir);
                        }
                        console.error('omk-atlas.js: Had trouble writing manifest.json. ' + dir);
                    }
                });

            });
        });
    } catch (err) {
        if(status){
            status.error = true;
            socket({error:JSON.stringify(err, null, 2), message:'omk-atlas.js: Unable to read Field Papers Atlas GeoJSON and write manifest.json.'});
        }
        console.log(err);
        console.error('omk-atlas.js: Unable to read Field Papers Atlas GeoJSON and write manifest.json.');
        console.error(JSON.stringify(err, null, 2));
    }
};

function extractOsmXml(dir, atlasGeoJSON, socket,status) {
    var features = atlasGeoJSON.features;

    // get the title from the atlas feature for file names
    var title = features[0].properties.title;

    // the second feature is the index page.
    var f = features[1];

    // osm file name without extension (added by bash script)
    var filePath = dir + '/' + title;

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

    // emit socket
    if(socket){
        status.msg = 'Extracting Osm XML...';

        posmMBTilesProc.stdout.on('data', function (data) {
            status.extractOSMxml.initialized = true;
            status.error = false;
            status.extractOSMxml.error = false;
            status.msg = 'Extracting Osm XML...';
            socket(data);
        });

        posmMBTilesProc.stdout.on('close', function (data) {
            status.extractOSMxml.complete = true;
            status.extractOSMxml.error = false;
            status.error = false;
            if(checkAtlasDeployCompletion(status)) status.complete = true;
            socket(data);
        });

        posmMBTilesProc.stderr.on('data', function (data) {
            status.extractOSMxml.error = true;
            status.error = true;
            status.extractOSMxml.msg = (typeof data == 'object') ? data.toString() : data;
            socket(status.extractOSMxml.msg);
        });
    }

    // the rest of the features are pages

}

function renderPosmCartoMBTiles(dir, atlasGeoJSON, socket,status) {
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

    if(socket){

        status.msg = 'Rendering POSM CartoDB MBTiles...';

        omkMBTilesProc.stdout.on('data', function (data) {
            status.renderMBTiles.initialized = true;
            status.renderMBTiles.error = false;
            status.error = false;
            status.msg = 'Rendering POSM CartoDB MBTiles...';
            socket(data);
        });

        omkMBTilesProc.stdout.on('close', function (data) {
            status.renderMBTiles.complete = true;
            status.renderMBTiles.error = false;
            status.error = false;
            if(checkAtlasDeployCompletion(status)) status.complete = true;
            socket(data);
        });

        omkMBTilesProc.stderr.on('data', function (data) {
            status.renderMBTiles.error = true;
            status.error = true;
            status.renderMBTiles.msg = (typeof data == 'object') ? data.toString() : data;
            socket(status.renderMBTiles.msg);
        });
    }

}

function copyAOIMBTilesToAtlasMBTiles(aoiDir, dir, atlasGeoJSON, socket,status) {
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

    if(socket){
        status.msg = 'Copying AIO MBTiles to Altas MBTiles...';

        omkMBTilesProc.stdout.on('data', function (data) {
            status.copyMBTiles.initialized = true;
            status.copyMBTiles.error = false;
            status.error = false;
            status.msg = 'Copying AIO MBTiles to Altas MBTiles...';
            socket(data);
        });

        omkMBTilesProc.stdout.on('close', function (data) {
            status.copyMBTiles.complete = true;
            status.copyMBTiles.error = false;
            status.error = false;
            if(checkAtlasDeployCompletion(status)) status.complete = true;
            socket(data);
        });

        omkMBTilesProc.stderr.on('data', function (data) {
            status.copyMBTiles.error = true;
            status.error = true;
            status.copyMBTiles.msg = (typeof data == 'object') ? data.toString() : data;
            socket(status.copyMBTiles.msg);
        });
    }
}

/**
 * return true if all 3 scripts are complete
 * @param status
 * @returns {boolean}
 */
function checkAtlasDeployCompletion (status) {
    var completedScripts = [];
    Object.keys(status).forEach(function(o){
        if(o == "copyMBTiles" && status[o].complete) completedScripts.push(o);
        if(o == "renderMBTiles" && status[o].complete) completedScripts.push(o);
        if(o == "extractOSMxml" && status[o].complete) completedScripts.push(o);
    });

    if(completedScripts.length == 3){
        status.msg = "The full deployment script has been executed.";
        status.initialized = false;
    }

    return completedScripts.length == 3;
}

function extractBBox(f) {
    return {
        left: f.geometry.coordinates[0][0][0],
        bottom: f.geometry.coordinates[0][0][1],
        right: f.geometry.coordinates[0][3][0],
        top: f.geometry.coordinates[0][1][1]
    };
}
