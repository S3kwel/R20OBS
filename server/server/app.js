'use strict';
var debug = require('debug');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cors = require('cors'); 
var request = require('request');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();
var s = null; 

//SOCKETIO
const sserver = require('http').Server(app); 
var io = require('socket.io')(sserver); 

app.io = io; 





// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors()); 

app.use('/', routes);
app.use('/users', users);

io.on('connection', function (socket) {
    console.log('client connected.');

    socket.on('parse', function (data) {
        console.log("PARSE REQUEST");
        console.log(typeof data); 

        if (data.content != null) {
            data.content = unescape(data.content);
            app.render('chat', data, function (err, data) {
                socket.emit("parsed", data);
            })
        }
        else {
            //data.content = unescape(data.content);
            console.log("PARSING AS ROLL");
            app.render('roll', data, function (err, data) {
                socket.emit("parsed", data);
            })
        }
       

        
    })
});




//Cause the server to start listening on (hopefully) the next available port.  
sserver.listen(process.env.PORT.substring(0, process.env.PORT.length - 1) + 1);
console.log('socket io server running.')


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function () {
    debug('Express server listening on port ' + server.address().port);
});
