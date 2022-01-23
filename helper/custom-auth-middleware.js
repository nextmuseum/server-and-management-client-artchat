const accessToken = require('express-access-token/lib/accessToken');
const { a0auth } = require('./Auth0Manager');

// check if there's a cookie user context or header authentication

exports.isAuthenticated = () => {
    return (req, res, next) => {

		let appSession = req.oidc.isAuthenticated();
		if (appSession) {
			req.user = req.oidc.user;
			return next();
		} 

		let accessToken = req.accessToken;
		if (!accessToken) return res.status(401).json({'error': 'not authenticated'});

		a0auth.getProfile( accessToken, function (err, userInfo) {
			if (err) {
			  // Handle error.
			  return res.status(401).json({'error': 'access token invalid'});
			  
			}

			req.user = userInfo;
			next();
		});        
    }
}