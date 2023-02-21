const { expressjwt: jwt } = require("express-jwt")
const jwks = require('jwks-rsa')
const { a0management } = require(__basedir + '/helper/Auth0Manager')


exports.isAuthenticated = (req, res, next) => {

	if (process.env.UNSAFE_SKIP_AUTH) return next()

	return jwt({
		secret: jwks.expressJwtSecret({
			cache: true,
			rateLimit: true,
			jwksRequestsPerMinute: 5,
			jwksUri: process.env.A0_ISSUER_BASE_URL + '/.well-known/jwks.json'
		}),
		audience: process.env.A0_API_IDENTIFIER,
		issuer: process.env.A0_ISSUER_BASE_URL + '/',
		algorithms: ['RS256']
	})(req, res, next)
}


// make sure that an auth0 user exists
exports.validateInjectAuthUser = () => (req, res, next) => {

	if (process.env.UNSAFE_SKIP_AUTH) return next()
	
    let authId = req.auth.sub
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

// injects user token from session into req.body if its not set
exports.presetSessionUserIdIntoBody = () => (req, res, next) => {

	if (process.env.UNSAFE_SKIP_AUTH) {
		if (req.body.userId)
			return next()

		return res.status(403).json({'error': 'SKIP_AUTH_MODE: `userId` key needs to be provided explicitly.'})
	}
    
	if (req.auth.sub) req.body.userId = req.body.userId || req.auth.sub.split('|')[1]
	return next()
}



