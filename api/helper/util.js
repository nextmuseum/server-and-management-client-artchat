module.exports.matchAuthor = async function matchAuthor(objectId, userId, store) {
    return new Promise((resolve, reject) => {
        store.getById(objectId, (response, err) => {
            console.log(response)
			if (err)
            	reject(err)
            if (response && response.userId == userId)
                resolve(true)
            else if (response && response.userId != userId)
                resolve(false)
			resolve(null)
        })
    })
}
