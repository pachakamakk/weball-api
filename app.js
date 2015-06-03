var express = require('express');
//var ssl = require('express-ssl');
//app.use(ssl());

var app = express();

var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var login = require('./routes/login');
var users = require('./routes/users');
//var clients = require('./routes/clients');
var me = require('./routes/me');
var photo = require('./routes/photo');
var matchs = require('./routes/matchs');
var chat = require('./routes/chat');

// UBER
var UBER_ID = 'zURMqUhzvDsPcZidFT11IU9sdDmZvd56';
var UBER_SECRET = 'C__CIcSCzs8WpWS790MjmnavxTODiDy4_8AzFyL6';
var UBER_TOKEN = 'pFivd4cIq6DFl5Jy_JeCYBe8eiCQve9z__oo7fj7';
var uberAuth = require('simple-oauth2')({
  clientId : UBER_ID,
  clientSecret : UBER_SECRET,
  name : 'WeBall',
  site : 'https://login.uber.com/oauth/authorize',
  tokenPath : 'https://login.uber.com/oauth/token',
  base_url : 'https://api.uber.com/v1/'
});

// PayPal
var paypal = require('paypal-rest-sdk');
var paypalConfig = require('./config/paypal');
paypal.configure(paypalConfig);
var paypalRoute = require('./routes/paypal')(paypal);

// Database
var mongoose = require('mongoose');
var dbConfig = require('./config/db');
mongoose.connect(dbConfig.url);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));

app.use(logger('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routes Point
app.use('/', index);
app.use('/login', login);
app.use('/users', users);
//app.use('/clients', clients);
app.use('/me', me);
app.use('/photo', photo);
app.use('/chat', chat);
app.use('/matchs', matchs);
app.use('/paypal', paypalRoute);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.json({
            message: err.message,
            code: err.status
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({
        message: err.message,
        code: err.status
    });
});

module.exports = app;
