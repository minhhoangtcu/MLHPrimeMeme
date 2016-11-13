const FB = require('fb');

function getPhotosLink (accessToken, size) {
	return new Promise((resolve, reject) => {
		getPhotosID(accessToken, size).then((ids) => {
			var promises = []
			ids.forEach((id) => {
				promises.push(getAPhoto(accessToken, id).then((data) => {
					console.log(data)
				}))
			})
			Promise.all(promises).then((data) => {
				resolve(data)
			}).catch((error) => {
				reject(error)
			})
		})
	})
}

function getPhotosID(accessToken, size) {
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
				if (response && !response.error) {
					console.log(response)
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

// getPhotosLink("EAAZA3zZCpZCS0IBAOy2WUzawEwMcDbgQNQx9ojJkXIAJd4ymOwNyTZBOerTiqMTBuu3LBzTf3a9Gvayz8zbfSATxNDc4ZAvv97j1qZAGPWs8yH5H7X73w9dsn7UX0dxDI8S6Y1ZBqRZCbB0whgqHRAKjDbl7D92BZCpoZD", 10).then((data) => console.log(data));
// getPhotosID("EAAZA3zZCpZCS0IBAOy2WUzawEwMcDbgQNQx9ojJkXIAJd4ymOwNyTZBOerTiqMTBuu3LBzTf3a9Gvayz8zbfSATxNDc4ZAvv97j1qZAGPWs8yH5H7X73w9dsn7UX0dxDI8S6Y1ZBqRZCbB0whgqHRAKjDbl7D92BZCpoZD", 10).then((data) => console.log(data));
getAPhoto("EAACEdEose0cBAJAe6KCTJ0nL73NnDJhMXSk8ZCSZAE0RdemwQaOw4wIMZBWMIIoQy8vqdQthdVeUvzWH69lNkJZAZBHJkS7R86cP6eZCRZAB8lp72osQrxNEjBZCKA6ZA0omzpUwhVUphzvbdriLRkDEraNpKq3O9rRFMU1BMVaymIQZDZD", "10207063282373454").then((data) => console.log(data));
// getPosts(accessToken, 10).then((data) => console.log(data));