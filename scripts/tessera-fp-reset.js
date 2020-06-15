#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var argv = require('minimist')(process.argv.slice(2));
var spawn = require('child_process').spawn;

var TESSERA_CONF_DIR = '/etc/tessera.conf.d';
var FP_CONF_PATH = '/opt/fp/fp-web/config/providers.json';

var POSM_SETTINGS = require('/etc/posm.json');
var POSM_BASE_URL = POSM_SETTINGS.posm_base_url || 'http://posm.io';

var ROOT_CHANGE_FP_CENTER_SH = __dirname + '/root_change-fp-center.sh';

if (typeof argv === 'object') {
    var manifestPath = argv._[0] || argv.m || argv.manifest;
    if (typeof manifestPath === 'string') {
        tesseraFieldPapersReset(manifestPath);
    }
}

module.exports = tesseraFieldPapersReset;

//tesseraFieldPapersReset('/opt/data/deployments/dvizarasekwa/manifest.json');

function tesseraFieldPapersReset(manifestPath, cb) {
    console.log('==> tessera-fp-reset.js');
    console.log('       manifest path: ' + manifestPath + '\n');

    fs.readFile(FP_CONF_PATH, 'utf-8', function (err, data) {

        var fpConf = JSON.parse(data);

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
                if (typeof properties !== 'object') continue;
                // NOTE: The property "type" within manifest content is not consistent,
                // Sometimes it appears as "type" and sometimes it appears as "Type"..
                // So, try to get the value of both attributes, prioritizing "type".
                var propertyType = properties.type || properties.Type;
                if (!propertyType || typeof propertyType !== 'string') continue;
                if (propertyType.toLowerCase().indexOf('mbtiles') > -1) {

                    // handle MBTiles
                    writeTesseraConf(manifest, manifestPath, filePath, 'mbtiles');
                    buildFieldPapersConf(manifest, filePath);

                } else if (propertyType.toLowerCase().indexOf('mapnik/xml') > -1) {

                    // handle Mapnik XML
                    //writeTesseraConf(manifest, manifestPath, filePath, 'mapnik');
                    //buildFieldPapersConf(manifest, filePath);

                }
            }

            // Write field papers conf file
            writeFieldPapersConf();

            function consoleCb(data, script) {
                if (typeof cb === 'function') {
                    cb({
                        output: data.toString(),
                        script: script
                    });
                }
                console.log(data.toString());
            }

            // Restart tessera
            var tesseraProc = spawn('sudo', ['service', 'tessera', 'restart']);
            tesseraProc.stdout.on('data', function (data) {
                consoleCb(data, 'sudo service tessera restart');
            });
            tesseraProc.stderr.on('data', function (data) {
                consoleCb(data, 'sudo service tessera restart');
            });
            tesseraProc.stderr.on('close', function (code) {

                // Set Field Papers center and restart
                var fpCenterScriptAndArgsArr = changeFpCenterScriptAndArgs(manifest);
                var fpCenterScriptAndArgsStr = fpCenterScriptAndArgsArr.join(' ');
                var fpProc = spawn('sudo', fpCenterScriptAndArgsArr);
                fpProc.stdout.on('data', function (data) {
                    consoleCb(data, fpCenterScriptAndArgsStr);
                });
                fpProc.stderr.on('data', function (data) {
                    consoleCb(data, fpCenterScriptAndArgsStr);
                });
                fpProc.stderr.on('close', function (code) {
                    var msg = 'Completed resetting configs for tessera and field papers. Reset services.\n==> tessera-fp-reset.js: END';
                    if (typeof cb === 'function') {
                        cb({
                            done: true,
                            code: code,
                            msg: msg
                        });
                    }
                    console.log(msg);
                });

            });

        });

        function writeTesseraConf(manifest, manifestPath, filePath, protocol) {
            var fileName = path.parse(filePath).base.split('.')[0];
            var k = '/tiles/' + manifest.name + '/' + fileName;
            var v = protocol + '://' + path.parse(manifestPath).dir + '/' + filePath;
            var conf = {};
            conf[k] = v;
            var confJSON =  JSON.stringify(conf, null, 2);
            var confPath = TESSERA_CONF_DIR + '/' + fileName + '.json';
            fs.writeFileSync(confPath, confJSON);
            console.log('wrote tessera config: ' + confPath);
            console.log(confJSON);
        }

        function buildFieldPapersConf(manifest, filePath) {
            var tileSet = manifest.contents[filePath];
            var name = path.parse(filePath).base.split('.')[0];
            var fpTileSet = fpConf[name] = {};
            tileSet.label ? fpTileSet.label = tileSet.label : fpTileSet.label = name;
            fpTileSet.template = POSM_BASE_URL + '/tiles/' + manifest.name + '/' + name + '/{z}/{x}/{y}.png';
            fpTileSet.minzoom = tileSet.minzoom || 0;
            fpTileSet.maxzoom = tileSet.maxzoom || 25;
        }

        function writeFieldPapersConf() {
            var fpConfJsonStr = JSON.stringify(fpConf, null, 2);
            fs.writeFileSync(FP_CONF_PATH, fpConfJsonStr);
            console.log('wrote field papers config: ' + FP_CONF_PATH);
            console.log(fpConfJsonStr);
        }

    });

}

function changeFpCenterScriptAndArgs(manifest) {
    var bbox = manifest.bbox;
    var lat = (bbox[1] + bbox[3]) / 2;
    var lng = (bbox[0] + bbox[2]) / 2;
    // Zoom of 10 is default for OpenStreetMap Website
    return [ROOT_CHANGE_FP_CENTER_SH, 10, lat, lng];
}
