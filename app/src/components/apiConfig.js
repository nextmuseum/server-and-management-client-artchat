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

let apiConfig

// local
if (process.env && process.env.NODE_ENV === 'local')
	apiConfig = config.local

// development
if (process.env && process.env.NODE_ENV === 'development')
	apiConfig = config.development

// production
if (process.env && process.env.NODE_ENV === 'production')
	apiConfig = config.production


export { apiConfig }