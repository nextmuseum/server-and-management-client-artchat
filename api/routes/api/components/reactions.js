const { ObjectId } = require("mongodb")

module.exports.transformReactions = function(response, userId) {
    const { reactions, ...rest} = response

    if (!reactions) 
        return response
    
	const distinctReactions = reactions.reduce((result, [reactionUserId, reaction]) => {
		result[reaction] ??= { count: 0, currentUser: false }
		result[reaction].count += 1
		result[reaction].currentUser = (reactionUserId === userId) || result[reaction].currentUser

		return result
	}, {})

    return {...rest, reactions: Object.entries(distinctReactions).map(([key, values]) => ({ 'reaction': key, ...values})) }
}

module.exports.toggleInsertReaction = async function(store, objectId, userId, reaction) {

	let hasReacted
	try {
		hasReacted = await new Promise((resolve, reject) => {
			store.getBySettings(
				{
					"_id": ObjectId(objectId),
					"reactions": [ userId, reaction ]
				},
				{},
				0,
				1,
				(response, error) => {
					if (response?.length) {
						resolve(true)
					} else if (response) {
						resolve(false)
					}
					reject(error)
				}
			)
		})
	} catch (error) {
		return Promise.reject({'error': 'failed to query reaction'})
	}

	if (hasReacted) {
		return new Promise((resolve, reject) => {
			store.addToSet(
				objectId,
				null,
				null,
				{ $pull: { reactions: [ userId, reaction ] } },
				(_, err) => {
					if(err){
						reject({'error': 'failed to unset reaction'})
					} 
					resolve()
				}   
			)
		})
	} else {
		return new Promise((resolve, reject) => {
			store.addToSet(
				objectId,
				null,
				null,
				{ $addToSet: { reactions: [ userId, reaction ] } },
				(_, err) => {
					if(err){
						reject({'error': 'failed to set reaction'})
					} 
					resolve()
				}   
			)
		})
	}
}