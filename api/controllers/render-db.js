var spawn = require('child_process').spawn;
var fs = require('fs');
var settings = require('../../settings');
var renderdbApi2PbfSh = __dirname + '/../../scripts/osm_render-db-api2pbf.sh';
var renderdbPbf2RenderSh = __dirname + '/../../scripts/gis_render-db-pbf2render.sh';
var statusUtility = require('../utilities/status');

module.exports = function (io) {

    // register status
    statusUtility.registerProcess('render-db', ['api2pbf', 'pbf2render']);

    function api2pbf() {
        var renderdbApi2PbfProc = spawn('sudo', ['-u', 'osm', renderdbApi2PbfSh]);

        function alertSocket(data) {
            var status = statusUtility.getStatus('render-db');

            io.emit('render-db', {
                controller: 'render-db',
                method: 'api2pbf',
                script: 'osm_render-db-api2pbf.sh',
                output: data.toString(),
                status: status
            });
            console.log(data.toString());
        }

        renderdbApi2PbfProc.stdout.on('data', function (data) {
            statusUtility.update('render-db', '', {initialized:true, error:false, msg: 'Dumping the API DB into a PBF.'});
            statusUtility.update('render-db', 'api2pbf', {initialized:true, error:false});
            alertSocket(data);
        });

        renderdbApi2PbfProc.stdout.on('close', function (data){
            statusUtility.update('render-db', 'api2pbf', {complete: true, error: false});
            statusUtility.update('render-db', '', {error: false});
            // check if all sub processes are complete
            if (checkRenderDBComplete()) statusUtility.update('', '', {complete: true});
            alertSocket(data);
        });

        renderdbApi2PbfProc.stderr.on('data', function (data) {
            var error = (typeof data == 'object') ? data.toString() : data;
            statusUtility.update('render-db', 'api2pbf', {error: true, msg: error});
            statusUtility.update('render-db', '', {error: true});
            alertSocket(error);
        });


    }

    function pbf2render() {
        var renderdbPbf2RenderProc = spawn('sudo', ['-u', 'gis', renderdbPbf2RenderSh]);

        function alertSocket(data) {
            var status = statusUtility.getStatus('render-db');

            io.emit('render-db', {
                controller: 'render-db',
                method: 'pbf2render',
                script: 'gis_render_db_pbf2render',
                output: data.toString(),
                status: status
            });
            console.log(data.toString());
        }

        renderdbPbf2RenderProc.stdout.on('data', function (data) {
            statusUtility.update('render-db', '', {initialized:true, error:false, msg: 'Importing PBF dump into Rendering DB via osm2pgsql.'});
            statusUtility.update('render-db', 'pbf2render', {initialized:true, error:false});
            alertSocket(data);
        });

        renderdbPbf2RenderProc.stdout.on('close', function (data){
            statusUtility.update('render-db', 'pbf2render', {complete: true, error: false});
            statusUtility.update('render-db', '', {error: false});
            // check if all sub processes are complete
            if (checkRenderDBComplete()) statusUtility.update('', '', {complete: true});
            alertSocket(data);
        });

        renderdbPbf2RenderProc.stderr.on('data', function (data) {
            var error = (typeof data == 'object') ? data.toString() : data;
            statusUtility.update('render-db', 'pbf2render', {error: true, msg: error});
            statusUtility.update('render-db', '', {error: true});
            alertSocket(error);
        });

    }

    function init(req, res, next) {

        //reset status
        statusUtility.resetProcess('render-db', ['api2pbf', 'pbf2render']);

        api2pbf();
        pbf2render();

        res.status(201).json({
            status: 201,
            msg: 'Rendering Database update...'
        });

    }

    function checkRenderDBComplete () {
        var completedScripts = [];
        var status = statusUtility.getStatus('render-db');

        Object.keys(status).forEach(function(o){
            if(o == "api2pbf" && status[o].complete) completedScripts.push(o);
            if(o == "pbf2render" && status[o].complete) completedScripts.push(o);
        });

        if (completedScripts.length == 2) {
            statusUtility.update('render-db', '', {
                complete: true,
                initialized: false,
                msg: 'The full deployment script has been executed.'
            });
        }

        return completedScripts.length == 2;
    }

    return {init: init};
};
