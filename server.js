var express = require('express'),
    morgan = require('morgan'),
    app = express(),
    http = require('http'),
    socketIO = require('socket.io'),
    config = require('./config'),
    server, io;
const jwt = require('jsonwebtoken');
const MongoClient = require('mongodb').MongoClient
    , assert = require('assert');
const expressValidator = require('express-validator');
const fileUpload = require('express-fileupload');
var bodyParser = require('body-parser');
// app.use(morgan('combined'));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(expressValidator());
app.use(fileUpload({ safeFileNames: true, preserveExtension: true }));
mongoDb = {};
client = {};
var elasticsearch = require('elasticsearch');
client = new elasticsearch.Client({
    host: config.elastic,
    log: 'trace'
});
try {
    client.cluster.health({}, function (err, resp, status) {
        if (err) {
            console.log("error, could not connect to elasic search", err);
        } else {
            console.log(resp);
        }
    });
} catch (exception) {
    console.log("exception occured while connection to elastic search cluster", exception);
}

MongoClient.connect(config.mongoDb, function (err, db) {
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
    client.ping({
        requestTimeout: 30000,
    }, function (error) {
        if (error) {
            console.error('elasticsearch cluster is down!');
        } else {
            console.log('All is well');
        }
    });
    res.sendFile(__dirname + '/index.html');
});

app.get('/chat', (req, res) => {
    res.sendFile(__dirname + '/chat.html');
});

const AuthController = require('./controllers/Auth/AuthController')(app, express);
app.use(AuthController);
const MediaController = require('./controllers/MediaController')(app, express);
app.use(MediaController);
const SearchController = require('./controllers/Search/SearchController')(app, express);
app.use(SearchController);
const ProductsController = require('./controllers/Product/ProductsController')(app, express);
app.use(ProductsController);
const imageProcessing = require('./controllers/ImageProcessing')(app, express);
app.use(imageProcessing);
const getMapping = require('./controllers/Search/getMappings')(app, express);
app.use(getMapping);

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
