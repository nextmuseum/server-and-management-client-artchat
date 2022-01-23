require('dotenv').config();

const app = require('express')();
const http = require('http').Server(app);


//  Server Port
const settings = { PORT: process.env.PORT || 4000 };

// Middleware Auth
const { auth, requiresAuth } = require('express-openid-connect');

const config = {
    authRequired: false,
    auth0Logout: true,
    baseURL: process.env.APP_HOST,
    secret: process.env.A0_SECRET,
    issuerBaseURL: process.env.A0_ISSUER_BASE_URL,
    clientID: process.env.A0_CLIENT_ID,
    clientSecret: process.env.A0_CLIENT_SECRET,
    authorizationParams: {
        response_type: 'code id_token',
        scope: 'openid profile email offline_access'
    }
};

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));

app.get('/app-login', (req, res) => {
    res.oidc.login({
        returnTo: config.baseURL + '/app-token'
    });
});

app.get('/app-token', requiresAuth(), async (req, res) => {

   
    let token = req.oidc.accessToken;
    token.refresh_token = req.oidc.refreshToken;

    //res.json(token);
    res.redirect('unitydl://' + JSON.stringify(token));
});

app.get('/app-renew-token/:', async (req, res) => {

    let { refresh } = req.oidc.accessToken;
    
    try {

    } catch (err) {
        res.statusCode(500).json(err);
    }

})
  

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

// Serve static files
app.use('/static', require('express').static('static'));

//  Start Server
http.listen(settings.PORT, function(){
    console.log('Server running on Port '+ settings.PORT);
});