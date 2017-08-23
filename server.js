var express = require('express'),
    morgan = require('morgan'),
    app = express(),
    http = require('http'),
    socketIO = require('socket.io'),
    server, io;
const jwt = require('jsonwebtoken');
const MongoClient = require('mongodb').MongoClient
    , assert = require('assert');
const expressValidator = require('express-validator');

// Connection URL 
const url = 'mongodb://localhost:27017/maverick';

var bodyParser = require('body-parser');
// app.use(morgan('combined'));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(expressValidator());
mongoDb = {};

MongoClient.connect(url, function (err, db) {
    if (err) {
        console.error(err);
        throw err;
    } else {
        console.log('MongoDb Connected');
        mongoDb = db;
        
    }
    //  db.close();
});

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.get('/chat', (req, res) => {
    res.sendFile(__dirname + '/chat.html');
});

// app.get('/register', (req, res) => {
//     res.sendFile(__dirname + 'register.html');

// });

const AuthController = require('./controllers/Auth/AuthController')(app, express);
app.use(AuthController);

server = http.Server(app);
// console.log("process.argv: " + process.argv);
server.listen(process.argv[2], (e, d) => {
    if (e) process.stdout.write("error encountered while starting express server: " + e + '\n');
    else process.stdout.write("express server started on port :" + process.argv[2] + '\n');
});


io = socketIO(server);
const startUsage = process.cpuUsage();
// console.log(startUsage);
io.on('connection', function (socket) {

    io.emit('user.add', socket.id);
    socket.on('disconnect', function () {
        io.emit('user.remove', socket.id);
    });

    socket.on('message.send', function (data) {
        io.emit('message.sent', data);
    });
});
