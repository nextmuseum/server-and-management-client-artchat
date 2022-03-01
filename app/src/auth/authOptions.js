let authOptions = {
	base : {
		"domain": "nextmuseum-io.eu.auth0.com",
		"client_id": "WxhqMy0ri0qs0PQ3t3wVRPUMdu4wITiU",
		"cacheLocation": "localstorage",
		"useRefreshTokens": true,
		"audience": "https://nextmuseum-artchat.herokuapp.com/api",
		"responseType": "token id_token",
		"scope": "openid profile"
	},
	local: {
		"redirect_uri": "http://localhost:8080/app/callback",
	},
	development: {
		"redirect_uri": "https://nextmuseum-artchat-dev.herokuapp.com/app/callback",
	},
	production: {
		"redirect_uri": "https://nextmuseum-artchat.herokuapp.com/app/callback",
	},
};

let authConfig

// dev
if (process.env && process.env.NODE_ENV === 'development')
	authConfig = Object.assign(authOptions.base, authOptions.local)

// general "production"
if (process.env && process.env.NODE_ENV === 'production')
	authConfig = Object.assign(authOptions.base, authOptions.development)

// remote dev
if (process.env && process.env.HEROKU_ENV === 'development')
	authConfig = Object.assign(authOptions.base, authOptions.development)

// remote production
if (process.env && process.env.HEROKU_ENV === 'production')
	authConfig = Object.assign(authOptions.base, authOptions.production)

export default authConfig

