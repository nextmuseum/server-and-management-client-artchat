let config = {
	local: {
		"apiBasePath": "http://localhost:4000/api/"
	},
	development: {
		"apiBasePath": "https://nextmuseum-artchat-dev.herokuapp.com/api/"
	},
	production: {
		"apiBasePath": "https://nextmuseum-artchat.herokuapp.com/api/"
	}
}

export default (process.env && process.env.NODE_ENV === 'development') ? config.development: config.production 
