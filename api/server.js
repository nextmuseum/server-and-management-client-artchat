require('dotenv').config()
global.__basedir = __dirname

const app = require('express')()
const http = require('http').Server(app)

// register logging
const morgan = require('morgan')
app.use(morgan('combined'))

// register request safety
const helmet = require("helmet")
app.use(helmet())


// Inject access tokens
const expressAccessToken = require('express-access-token')
app.use(expressAccessToken)

//  Server Port
const settings = { PORT: process.env.PORT || 4000 }


//  Middleware Headers
app.use(function (req, res, next) {
    // Website allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*')
    // Request methods to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
    // Request headers to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type')

    next()
})


//  Middleware Json
app.use(require('express').json())
app.use(function (error, req, res, next) {
    if (error instanceof SyntaxError)
    res.status(400).set("Content-Type", 'application/json').json({'errors': error}).end()
    else next()
})

//
// ROUTES
//

// Unity auth handler
const authRoutes = require('./routes/authRoutes')
app.use('/auth', authRoutes)

// API routes
const apiRoutes = require('./routes/apiRoutes')
app.use('/api', apiRoutes)

// Serve static files
app.use('/static', require('express').static('static'))

// Start Server
http.listen(settings.PORT, function(){
    console.log('Server running on Port '+ settings.PORT)
})