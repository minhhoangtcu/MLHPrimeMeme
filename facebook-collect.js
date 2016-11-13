const FB = require('fb');

// var	accessToken = 'EAACEdEose0cBAJAe6KCTJ0nL73NnDJhMXSk8ZCSZAE0RdemwQaOw4wIMZBWMIIoQy8vqdQthdVeUvzWH69lNkJZAZBHJkS7R86cP6eZCRZAB8lp72osQrxNEjBZCKA6ZA0omzpUwhVUphzvbdriLRkDEraNpKq3O9rRFMU1BMVaymIQZDZD'

function getPhotosLink (accessToken, size) {
	return new Promise((resolve, reject) => {
		getPhotoIDs(accessToken, size).then((ids) => {
			var promises = []
			ids.forEach((id) => {
				console.log(id)
				promises.push(getAPhoto(accessToken, id))
			})
			Promise.all(promises).then((data) => {
				resolve(data)
			}).catch((error) => {
				reject(error)
			})
		})
	})
}

function getPhotoIDs(accessToken, size) {
	return new Promise((resolve, reject) => {
		FB.options({accessToken: accessToken});
		FB.api(
			'/me',
			'GET',
			{"fields":`photos.limit(${size}){id}`},
			function(response) {
				if (response && !response.error) {
					resolve(
						response.photos.data
						.map((image) => image.id)
					);
				} else {
					reject(response.error);
				}
			}
		);
	})
}

function getAPhoto(accessToken, id) {
	return new Promise((resolve, reject) => {
		FB.options({accessToken: accessToken});
		FB.api(
			id,
			function (response) {
				console.log(response)
				if (response && !response.error) {
					resolve(response.images[0].source);
				} else {
					reject(response.error);
				}
			}
		);
	})	
}



function getPostsOfUser (accessToken, size) {
	return new Promise((resolve, reject) => {
		FB.options({accessToken: accessToken});
		FB.api(
			'/me',
			'GET',
			{"fields":`id,name,posts.limit(${size})`},
			function(response) {
				if (!response || response.error) {
					reject(response.error);
				} else {
					resolve(
						response.posts.data
						.filter( (post) => post.message)
						.map((post) => post.message)
					)
				}
			}
		);
	})
}

exports.getPostsOfUser = getPostsOfUser;
exports.getPhotosLink = getPhotosLink;

// getPhotosLink(accessToken, 10).then((data) => console.log(data));
// getPhotosID(accessToken, 10).then((data) => console.log(data));
getAPhoto(accessToken, "1054981821244385").then((data) => console.log(data));
// getPosts(accessToken, 10).then((data) => console.log(data));