var express = require('express');
var directory = require('serve-index');
var cors = require('cors');
var bodyParser = require('body-parser');
var routes = require('./api/routes');
var settings = require('./settings');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http, {path: '/posm-admin/socket.io'});
var statusUtility = require('./api/utilities/status');

// Enable CORS always.
app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use('/posm-admin/pages', express.static(__dirname + '/pages'));
app.use('/posm-admin/pages', directory(__dirname + '/pages'));

// Initialize persistent status object
statusUtility.init(function(){
    // API Routes.
    app.use('/posm-admin', routes(io));
});

var port = process.env.PORT || settings.port;
http.listen(port, function() {
    console.log('posm-admin listening on port ' + port);
});
