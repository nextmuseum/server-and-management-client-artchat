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

const { a0management } = require('./Auth0Manager')
module.exports.getAuthUserByIdSuffix = async function (userId) {
    return new Promise((resolve, reject) => {
        a0management.getUsers({ q: `user_id:*${userId}` }) // look for (auth0|)userId suffix
        .then(response => {
            if (response)
                resolve(response[0])
            resolve(null)
        })
        .catch(err => {
            reject(err.originalError.response.text)
        })
    })
}

module.exports.deleteAuthUserById = async function (userId) {
    return new Promise((resolve, reject) => {
        a0management.deleteUser({ id: userId }) // look for (auth0|)userId suffix
        .then(response => {
            if (response)
                resolve(response[0])
            resolve(null)
        })
        .catch(err => {
            reject(err.originalError.response.text)
        })
    })
}