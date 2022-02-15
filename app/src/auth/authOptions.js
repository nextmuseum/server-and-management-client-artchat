module.exports = {
	development: {
		"domain": "nextmuseum-io.eu.auth0.com",
		"client_id": "WxhqMy0ri0qs0PQ3t3wVRPUMdu4wITiU",
		"redirect_uri": "http://localhost:8080/app/callback",
		"cacheLocation": "localstorage",
		"useRefreshTokens": true,
		"audience": "https://nextmuseum-artchat.herokuapp.com/api",
		"responseType": "token id_token",
		"scope": "openid profile"
	},
	production: {
		"domain": "nextmuseum-io.eu.auth0.com",
		"client_id": "WxhqMy0ri0qs0PQ3t3wVRPUMdu4wITiU",
		"redirect_uri": "http://localhost:4000/app/callback",
		"cacheLocation": "localstorage",
		"useRefreshTokens": true,
		"audience": "https://nextmuseum-artchat.herokuapp.com/api"
	},
};

