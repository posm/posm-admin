#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var argv = require('minimist')(process.argv.slice(2));

var TESSERA_CONF_DIR = '/etc/tessera.conf.d';
var FP_CONF_PATH = '/opt/fp/fp-web/config/providers.json';

// FIXME This should not be hardcoded.
var POSM_BASE_URL='http://posm.local';

if (typeof argv === 'object') {
    var manifestPath = argv._[0] || argv.m || argv.manifest;
    if (typeof manifestPath === 'string') {
        tesseraFieldPapersReset(manifestPath);
    }
}

module.exports = tesseraFieldPapersReset;

//tesseraFieldPapersReset('/opt/data/deployments/dvizarasekwa/manifest.json');

function tesseraFieldPapersReset(manifestPath, cb) {

    // TODO Read current conf from file first.
    var fpConf = {};

    fs.readFile(manifestPath, 'utf-8', function (err, data) {
        var manifest = JSON.parse(data);
        if (err) {
            var errObj = {
                err: err,
                msg: 'Bad path for manifest. Unable to update and reset tessera and Field Papers.'
            };
            if (typeof cb === 'function') {
                cb(errObj);
            } else {
                console.error(errObj);
            }
            return;
        } else if (typeof manifest !== 'object' || typeof manifest.contents !== 'object') {
            var errObj = {
                err: true,
                msg: 'The manifest does not contain a contents object.'
            };
            if (typeof cb === 'function') {
                cb(errObj);
            } else {
                console.error(errObj);
            }
            return;
        }

        // Read Manifest
        var contents = manifest.contents;
        for (var filePath in contents) {
            var properties = contents[filePath];
            if (typeof properties !== 'object' && typeof properties.type !== 'string') continue;
            if (properties.type.toLowerCase().indexOf('mbtiles') > -1) {

                // handle MBTiles
                writeTesseraConf(manifest, manifestPath, filePath, 'mbtiles');
                writeFieldPapersConf(manifest, filePath);

            } else if (properties.type.toLowerCase().indexOf('mapnik/xml') > -1) {

                // handle Mapnik XML
                //writeTesseraConf(manifest, manifestPath, filePath, 'mapnik');
                //writeFieldPapersConf(manifest, filePath);

            }
        }

    });

    function writeTesseraConf(manifest, manifestPath, filePath, protocol) {
        var fileName = path.parse(filePath).base.split('.')[0];
        var k = 'tiles/' + manifest.name + '/' + fileName;
        var v = protocol + '://' + path.parse(manifestPath).dir + '/' + filePath;
        var conf = {};
        conf[k] = v;
        var confJSON =  JSON.stringify(conf);
        var confPath = TESSERA_CONF_DIR + '/' + fileName + '.json';
        fs.writeFile(confPath, confJSON, function(err) {
            if (err) {
                var errObj = {
                    err: err,
                    msg: 'There was a problem writing a tessera conf file.'
                };
                if (typeof cb === 'function') {
                    cb(errObj);
                } else {
                    console.error(errObj);
                }
            }
        });
    }

    function writeFieldPapersConf(manifest, filePath) {
        var tileSet = manifest.contents[filePath];
        var name = path.parse(filePath).base.split('.')[0];
        var fpTileSet = fpConf[name] = {};
        tileSet.label ? fpTileSet.label = tileSet.label : fpTileSet.label = name;
        fpTileSet.template = POSM_BASE_URL + '/tiles/' + manifest.name + '/' + name + '/{z}/{x}/{y}.png';
        fpTileSet.minzoom = tileSet.minzoom || 0;
        fpTileSet.maxzoom = tileSet.maxzoom || 25;

        fs.writeFile(FP_CONF_PATH, JSON.stringify(fpConf), function(err) {
            if (err) {
                var errObj = {
                    err: err,
                    msg: 'There was a problem writing the field papers conf file.'
                };
                if (typeof cb === 'function') {
                    cb(errObj);
                } else {
                    console.error(errObj);
                }
            }
        });
    }
}
