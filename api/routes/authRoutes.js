var express = require('express')
var router = express.Router()

const { requiresAuth } = require('express-openid-connect')
const { a0auth } = require('../helper/Auth0Manager')

// Middleware Auth0
const { auth } = require('express-openid-connect')

const config = {
    authRequired: false,
    auth0Logout: true,
    baseURL: process.env.APP_HOST + '/auth',
    secret: process.env.A0_SECRET,
    issuerBaseURL: process.env.A0_ISSUER_BASE_URL,
    clientID: process.env.A0_CLIENT_ID,
    clientSecret: process.env.A0_CLIENT_SECRET,
    authorizationParams: {
        response_type: 'code id_token',
        scope: 'openid profile email offline_access',
		audience: process.env.A0_API_IDENTIFIER
    }
}

// auth router attaches /login, /logout, and /callback routes to the baseURL
router.use(auth(config))


router.get('/userinfo', (req, res) => {
	res.json(req.oidc.user)
})

// dedicated login method for unity app login
router.get('/login-unity', (req, res) => {
    res.oidc.login({
        returnTo: process.env.APP_HOST + '/auth/forward-token'
    })
})

// handle callback and send tokens to app protocol
router.get('/forward-token', requiresAuth(), async (req, res) => {

    let { access_token, token_type, expires_in } = req.oidc.accessToken
    let token = { access_token, token_type, expires_in }
    token.refresh_token = req.oidc.refreshToken

	//console.log(token)
    res.redirect('artchatdl://session?' + new URLSearchParams(token).toString())
})

// helper endpoint for app refresh token query
router.get('/renew-token', async (req, res) => {

    let refresh_token = req.query.refresh_token

    if (typeof refresh_token == 'undefined') res.status(400).json({message: 'refresh_token query param is missing.'}).end()

    await a0auth.refreshToken({refresh_token: refresh_token}, function (err, userData) {
    
        if (err) {
            res.status(403).json(JSON.parse(err.message))
        }

        res.json(userData)
    })

})

router.get('/logout-unity', (req, res) => {
    res.oidc.logout({
        returnTo: process.env.APP_HOST + '/auth/login-unity'
    })
})

module.exports = router