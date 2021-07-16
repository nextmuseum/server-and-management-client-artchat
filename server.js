const app = require('express')();
const http = require('http').Server(app);

//  Server Port
const settings = { PORT: process.env.PORT || 4000 };

//  MongoDB
global.mongoURI = "mongodb+srv://artchat_admin:LEPT6grig!seek9heat@artchat.bsx6x.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

//  Middleware Headers
app.use(function (req, res, next) {
    // Website allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type');

    next();
});

//  Middeleware Log
app.use(function timeLog(req, res, next) {
    console.log('-----------------------');
    console.log('Time: ', new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''));
    console.log('Method: ', req.method);
    console.log('URL: ', req.url);

    next();
});

//  Middleware Json
app.use(require('express').json());
app.use(function (error, req, res, next) {
    if (error instanceof SyntaxError)
    res.status(400).set("Content-Type", 'application/json').json({'errors': error}).end();
    else next();
});

//  Routes
const exhibition = require('./routes/exhibition');
app.use('/exhibition', exhibition);
const artwork = require('./routes/artwork');
app.use('/artwork', artwork);
const comment = require('./routes/comment');
app.use('/comment', comment);
const user = require('./routes/user');
app.use('/user', user);


//  Start Server
http.listen(settings.PORT, function(){
    console.log('Server running on Port '+ settings.PORT);
});