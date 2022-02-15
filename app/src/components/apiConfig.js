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
if (process.env && process.env.NODE_ENV === 'development')
	apiConfig = config.local

// general "production"
if (process.env && process.env.NODE_ENV === 'development')
	apiConfig = config.development

// remote dev
if (process.env && process.env.HEROKU_ENV === 'development')
	apiConfig = config.development

// remote production
if (process.env && process.env.HEROKU_ENV === 'production')
	apiConfig = config.production

export default apiConfig