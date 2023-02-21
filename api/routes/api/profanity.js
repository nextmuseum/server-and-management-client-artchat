const express = require('express')
const router = express.Router()

const { requireJson, checkSchema, validate} = require(__basedir + '/helper/custom-middleware')
const guard = require('express-jwt-permissions')({ requestProperty: 'auth' })

const profanitySchema = require(__basedir + '/schemas/profanity')

const _modelTemplate = require(__basedir + '/models/_modelTemplate')
const profanityStore = new _modelTemplate("profanity")

/*
*   Routing
*/

router.get('/:lang', [ validate()], (req,res) => {

	const { lang } = req.params

	profanityStore.getBySettings({ "lang": { "$in": [lang] } },{},0,10, (response, err) => {
		if (err)
            return res.status(500).json({'error': err })
        if(!response || response.length === 0)
            return res.status(404).end()

        res.status(200).set("Content-Type", 'application/json').json(response[0]?.dictionary)
	})
})


router.post('/:lang',
    [ guard.check("update:profanity"),
	requireJson(),
    checkSchema(profanitySchema.POST)],
    async (req, res) => {
        const { wordlist } = req.body
        const { lang } = req.params

		let settings = { "lang": { "$in": [lang] } }

		try {
			const { _id: objectId } = await new Promise((resolve, reject) => {
				profanityStore.getBySettings(settings,{},0,10, (response, err) => {
					if(response && response.length == 0 ) 
						reject(404)
					else if (response && response.length > 0 )
						resolve(response[0])
					reject(err)
				})
			})

			profanityStore.addToSet(
				objectId,
				null,
				null,
				{ $addToSet: { dictionary: { $each: wordlist } } },
				(_, err) => {
					if(err){
						throw new Error(err)
					} 
					res.status(204).send()
				}   
			)

		} catch (e) {
			if (e === 404) {
				return res.status(404).json({'error': `profanity dictionary with lang ${lang} not found`})
			}

			return res.status(500).json(JSON.stringify(err))
		}
    }
)


module.exports = router