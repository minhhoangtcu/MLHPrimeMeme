const RapidAPI = new require('rapidapi-connect');
const rapid = new RapidAPI('JiboUp', '9bb11e09-8d1f-41b8-8901-6871186bf5eb');

function getPostsOfUser(accessToken) {

	return new Promise((resolve, reject) => {

	posts = []
	getTimeline(accessToken)
	.then( (timeline) => {
		timelineJson = JSON.parse(timeline).data

		// filter out non mess and use mess
		resolve( timelineJson
					.slice(0, 20)
					.filter((post) => post.message)
					.map((post) => post.message)
		)

	}).catch( (error) => {
		console.log(error);
	});
})}

function getTimeline(accessToken) {
	return new Promise((resolve, reject) => {
		rapid.call('FacebookGraphAPI', 'getUsersFeed', { 
			'access_token': accessToken,
			'user_id': ''
		}).on('success', (payload)=>{
			console.log("yeh success")
			resolve(payload)
		}).on('error', (payload)=>{
			console.log("o no failed")
			reject(payload)
		})
	})
}

exports.getPostsOfUser = getPostsOfUser;