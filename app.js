const express = require('express');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const bodyparser = require('body-parser');
const fs = require('fs');
const mustache = require('mustache-express');
const ws = require('ws');
const uuid = require('uuid');

var app = express();

// const hostname = '127.0.0.1';
const port = '8080';
const sessionParser = session({
    store: new FileStore,
    saveUninitialized: true,
    secret: '$uPeR$ecUr3',
    resave: true
});

app.use(express.static('static'));
app.engine('html', mustache());
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.use(sessionParser);
app.use(bodyparser.json());

let rawdata = fs.readFileSync('game.json');
var paths = JSON.parse(rawdata);

app.post('/login', function(req, res) {
    const id = uuid.v4();
    req.session.userId = id;
    req.session.username = req.body.username;
    req.session.accesscode = req.body.accesscode;
    // res.header("Access-Control-Allow-Origin", "http://127.0.0.1:8080");
    res.send({result: 200, message: "Session updated"});
})

app.get('/', function(req, res) {
    res.render('login');
});

app.get('/home', function(req, res) {
    res.render('home', {"username": req.session.username, "accesscode": req.session.accesscode});
})

app.get('/api/:endpoint', function(req, res) {
    res.json(paths[req.params.endpoint]);
});

const ws_server = new ws.Server({port: 8081});
ws_server.on('connection', (websocket, req) => {
    websocket.on('message', (message) => {
        ws_server.clients.forEach((client) => {
            if(client !== websocket && client.readyState === ws.OPEN) {
                client.send(message);
            }
        });
    });
});

// const server = app.listen(port, hostname);
const server = app.listen(port);