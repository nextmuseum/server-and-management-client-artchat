const jwt = require('express-jwt');
const jwks = require('jwks-rsa');

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
});