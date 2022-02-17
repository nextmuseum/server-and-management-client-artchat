const jwt = require('express-jwt')
const jwks = require('jwks-rsa')
const { a0management } = require(__basedir + '/helper/Auth0Manager')


exports.isAuthenticated = jwt({
	secret: jwks.expressJwtSecret({
		cache: true,
		rateLimit: true,
		jwksRequestsPerMinute: 5,
		jwksUri: process.env.A0_ISSUER_BASE_URL + '/.well-known/jwks.json'
	}),
	audience: process.env.A0_API_IDENTIFIER,
	issuer: process.env.A0_ISSUER_BASE_URL + '/',
	algorithms: ['RS256']
})


// make sure that an auth0 user exists
exports.validateInjectAuthUser = () => (req, res, next) => {
    let authId = req.user.sub
    a0management.getUser({ id: authId })
	.then(user => {
        req.authUser = user
		next()
    })
	.catch(err => {
        console.log(JSON.stringify(err))
        return res.status(403).json({'error': `auth user ${req.params.authId} not found`})
    })
}

// injects user token from session into req.body
exports.injectUserIdIntoBody = () => (req, res, next) => {
    
	if (req.user.sub) req.body.userId = req.user.sub.split('|')[1]
	return next()
}



