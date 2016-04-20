var spawn = require('child_process').spawn;
var fs = require('fs');
var settings = require('../../settings');
var renderdbApi2PbfSh = __dirname + '/../../scripts/osm_render-db-api2pbf.sh';
var renderdbPbf2RenderSh = __dirname + '/../../scripts/gis_render_db_pbf2render';

module.exports = function (io, status) {

    if (!status['render-db']) {
        status['render-db'] = {complete: false, initialized: false, msg: ""};
        status['render-db'].api2pbf = {};
        status['render-db'].pbf2render = {};
    }

    function api2pbf() {
        var renderdbApi2PbfProc = spawn('sudo', ['-u', 'osm', renderdbApi2PbfSh]);

        function alertSocket(data) {
            io.emit('render-db', {
                controller: 'render-db',
                method: 'api2pbf',
                script: 'osm_render-db-api2pbf.sh',
                output: data.toString(),
                status: status['render-db']
            });
            console.log(data.toString());
        }

        status['render-db'].msg = 'Dumping the API DB into a PBF.';
        status['render-db'].initialized = true;

        renderdbApi2PbfProc.stdout.on('data', function (data) {
            status['render-db'].api2pbf.error = false;
            status['render-db'].error = false;
            alertSocket(data);
        });

        renderdbApi2PbfProc.stdout.on('close', function (data){
            status['render-db'].api2pbf.complete = true;
            status['render-db'].api2pbf.error = false;
            status['render-db'].error = false;
            if(checkRenderDBComplete(status['render-db'])) status['render-db'].complete = true;

            alertSocket(data);
        });

        renderdbApi2PbfProc.stderr.on('data', function (data) {
            status['render-db'].api2pbf.error = true;
            status['render-db'].error = true;
            status['render-db'].api2pbf.msg = (typeof data == 'object') ? data.toString() : data;

            alertSocket(status['render-db'].api2pbf.msg);
            alertSocket(status['render-db'].api2pbf.msg);
        });


    }

    function pbf2render() {
        var renderdbPbf2RenderProc = spawn('sudo', ['-u', 'gis', renderdbPbf2RenderSh]);

        function alertSocket(data) {
            io.emit('render-db', {
                controller: 'render-db',
                method: 'pbf2render',
                script: 'gis_render_db_pbf2render',
                output: data.toString(),
                status: status['render-db']
            });
            console.log(data.toString());
        }

        status['render-db'].msg = 'Importing PBF dump into Rendering DB via osm2pgsql.';
        status['render-db'].initialized = true;

        renderdbPbf2RenderProc.stdout.on('data', function (data) {
            status['render-db'].pbf2render.error = false;
            status['render-db'].pbf2render.msg = data;

            alertSocket(data);
        });

        renderdbPbf2RenderProc.stdout.on('close', function (data){
            status['render-db'].pbf2render.complete = true;
            status['render-db'].pbf2render.error = false;
            status['render-db'].error = false;
            if(checkRenderDBComplete(status['render-db'])) status['render-db'].complete = true;

            alertSocket(data);
        });

        renderdbPbf2RenderProc.stderr.on('data', function (data) {
            status['render-db'].pbf2render.error = true;
            status['render-db'].error = true;
            status['render-db'].pbf2render.msg = (typeof data == 'object') ? data.toString() : data;

            alertSocket(status['render-db'].pbf2render.msg);
        });

    }

    function init(req, res, next) {

        //reset status
        status['render-db'] = {complete: false, initialized: false, msg: ""};
        status['render-db'].api2pbf = {};
        status['render-db'].pbf2render = {};

        api2pbf();
        pbf2render();

        res.status(201).json({
            status: 201,
            msg: 'Rendering Database update...'
        });

    }

    function checkRenderDBComplete (status) {
        var completedScripts = [];
        Object.keys(status).forEach(function(o){
            if(o == "api2pbf" && status[o].complete) completedScripts.push(o);
            if(o == "pbf2render" && status[o].complete) completedScripts.push(o);
        });

        if(completedScripts.length == 2){
            status.msg = "The full deployment script has been executed.";
            status.initialized = false;
        }

        return completedScripts.length == 2;
    }

    return {init: init};
};
