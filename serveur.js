'use strict';

var express = require('express');
var app = express();
var api = require('./api/api');


app.use('/', express.static('public'));
app.use('/api', api);

app.listen(80);
