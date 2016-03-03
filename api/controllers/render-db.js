var spawn = require('child_process').spawn;
var fs = require('fs');
var settings = require('../../settings');
var renderdbApi2PbfSh = __dirname + '/../../scripts/render-db-api2pbf.sh';
var renderdbPbf2RenderSh = __dirname + '/../../scripts/render-db-pbf2render.sh';

module.exports = function (io, status) {

    if (!status['render-db']) status['render-db'] = {};
    if (!status['render-db'].api2pbf) status['render-db'].api2pbf = {};
    if (!status['render-db'].pbf2render) status['render-db'].pbf2render = {};

    function api2pbf(req, res, next) {
        var renderdbApi2PbfProc = spawn('sudo', ['-u', 'osm', renderdbApi2PbfSh]);

        function alertSocket(data) {
            io.emit('render-db', {
                controller: 'render-db',
                method: 'api2pbf',
                script: 'render-db-api2pbf.sh',
                output: data.toString()
            });
            console.log(data.toString());
        }

        renderdbApi2PbfProc.stdout.on('data', function (data) {
            alertSocket(data);
        });
        renderdbApi2PbfProc.stderr.on('data', function (data) {
            alertSocket(data);
        });

        renderdbApi2PbfProc.stderr.on('close', function (code) {
            if (code === false) {
                status['render-db'].api2pbf = 'done';
            } else {
                status['render-db'].api2pbf = 'error';
            }
            io.emit('render-db', {
                controller: 'render-db',
                method: 'api2pbf',
                script: 'render-db-api2pbf.sh',
                close: true,
                code: code,
                status: status['render-db']
            });
            if (code === false && typeof next === 'function') {
                next();
            }
        });

        if (typeof res !== 'undefined') {
            res.status(200).json({
                status: 200,
                msg: 'Dumping the API DB into a PBF.'
            });
        }
    }

    function pbf2render(req, res, next) {
        var renderdbPbf2RenderProc = spawn('sudo', ['-u', 'gis', renderdbPbf2RenderSh]);

        function alertSocket(data) {
            io.emit('render-db', {
                controller: 'render-db',
                method: 'pbf2render',
                script: 'render-db-pbf2render.sh',
                output: data.toString()
            });
            console.log(data.toString());
        }

        renderdbPbf2RenderProc.stdout.on('data', function (data) {
            alertSocket(data);
        });
        renderdbPbf2RenderProc.stderr.on('data', function (data) {
            alertSocket(data);
        });

        renderdbPbf2RenderProc.stderr.on('close', function (code) {
            if (code === false) {
                status['render-db'].pbf2render = 'done';
            } else {
                status['render-db'].pbf2render = 'error';
            }
            io.emit('render-db', {
                controller: 'render-db',
                method: 'pbf2render',
                script: 'render-db-pbf2render.sh',
                close: true,
                code: code,
                status: status['render-db']
            });
            if (code === false && typeof next === 'function') {
                next();
            }
        });

        if (typeof res !== 'undefined') {
            res.status(200).json({
                status: 200,
                msg: 'Importing PBF dump into Rendering DB via osm2pgsql.'
            });
        }

    }

    function all(req, res, next) {

    }

    return { api2pbf: api2pbf, pbf2render: pbf2render, all: all };
};
