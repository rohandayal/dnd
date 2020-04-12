const express = require('express');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const bodyparser = require('body-parser');
const fs = require('fs');
const mustache = require('mustache-express');
const ws = require('ws');

var app = express();

// const hostname = '127.0.0.1';
const PORT = process.env.PORT || 8080;
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
const server = require('http').Server(app);
const io = require('socket.io')(server);

function rot13(str) {
    var input     = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    var output    = 'NOPQRSTUVWXYZABCDEFGHIJKLMnopqrstuvwxyzabcdefghijklm';
    var index     = x => input.indexOf(x);
    var translate = x => index(x) > -1 ? output[index(x)] : x;
    return str.split('').map(translate).join('');
}

app.post('/login', function(req, res) {
    req.session.username = req.body.username;
    res.send({result: 200, message: "Session updated"});
})

app.get('/', function(req, res) {
    res.render('login');
});

app.get('/home', function(req, res) {
    res.render('home', {"username": req.session.username, demo: false});
})

app.get('/master', function(req, res) {
    res.render('master', {"username": "GameMaster"});
})

app.get('/demo', function(req, res) {
    res.render('home', {"username": req.session.username, demo: true});
})

app.get('/api/:endpoint', function(req, res) {
    res.send(rot13(JSON.stringify(paths[req.params.endpoint])));
});

io.on('connection', (socket) => {
    socket.on('progress', (msg) => {
        io.emit('progress', msg);
    });
    socket.on('interaction', (msg) => {
        io.emit('interaction', msg);
    });
});

server.listen(PORT);