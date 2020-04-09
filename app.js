const express = require('express');
const fs = require('fs');
const mustache = require('mustache-express');

var app = express();
const router = express.Router();

const hostname = '127.0.0.1';
const port = '8080';

app.use(express.static('static'));
app.engine('html', mustache());
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

let rawdata = fs.readFileSync('game.json');
var paths = JSON.parse(rawdata);

app.get('/', function(req, res) {
    res.render('home');
});

for (var key in paths) {
    if (!paths.hasOwnProperty(key)) continue;
    app.get('/' + key, function(req, res) {
        res.json(paths[key]);
    });
}

app.listen(port);