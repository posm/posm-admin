#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var argv = require('minimist')(process.argv.slice(2));

var TESSERA_CONF_DIR = '/etc/tessera.conf.d';

if (typeof argv === 'object') {
    var manifestPath = argv._[0] || argv.m || argv.manifest;
    tesseraFieldPapersReset(manifestPath);
}

module.exports = tesseraFieldPapersReset;

function tesseraFieldPapersReset(manifestPath, cb) {
    fs.readFile(manifestPath, function (err, manifest) {
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
        }

        // Read Manifest
        var contents = manifest.contents;
        for (var filePath in contents) {
            var properties = contents[filePath];
            if (properties.type.toLowerCase().indexOf('mbtiles') > -1) {

                // handle MBTiles
                writeTesseraConf(manifest, manifestPath, filePath, 'mbtiles');

            } else if (properties.type.toLowerCase().indexOf('mapnik/xml') > -1) {

                // handle Mapnik XML
                writeTesseraConfig(manifest, manifestPath, filePath, 'mapnik');

            }
        }

    });

    function writeTesseraConf(manifest, manifestPath, filePath, protocol) {
        var fileName = path.parse(filePath).base.split('.')[0];
        var k = 'deployment/' + manifest.name + '/tiles/' + fileName;
        var v = protocol + '://' + path.parse(manifestPath).dir + '/' + filePath;
        var conf =  {k: v};
        var confPath = TESSERA_CONF_DIR + '/' + fileName + '.json';
        fs.writeFile(confPath, conf, function(err) {
            var errObj = {
                err: err,
                msg: 'There was a problem writing a tessera conf file.'
            };
            if (typeof cb === 'function') {
                cb(errObj);
            } else {
                console.error(errObj);
            }
        });
    }
}
