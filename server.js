var tty = require('tty.js');
var express = require('express');
var directory = require('serve-index');
var cors = require('cors');
var bodyParser = require('body-parser');
var routes = require('./api/routes');
var settings = require('./settings');

var app = tty.createServer({
    shell: 'bash',
    users: {
        posm: 'posm'
    },
    port: settings.port
});

// Enable CORS always.
app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use('/posm-admin/pages', express.static(__dirname + '/pages'));
app.use('/posm-admin/pages', directory(__dirname + '/pages'));

// API Routes.
app.use('/posm-admin', routes(app.io));

app.listen();
