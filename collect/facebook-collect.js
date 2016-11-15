const FB = require('fb');

function getPhotosLink (accessToken, size) {
	return new Promise((resolve, reject) => {
		getPhotoIDs(accessToken, size).then((ids) => {
			var promises = []
			ids.forEach((id) => {
				promises.push(getAPhoto(accessToken, id)
				// .then((data) => {
				// 	console.log(data)
				// })
				)
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