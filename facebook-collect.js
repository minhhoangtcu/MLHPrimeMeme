const FB = require('fb');

//EAAZA3zZCpZCS0IBAORgqOMSOafhvvZCk3BFVgfYUtlc1nfWtTUKhdp4OvUaTY4a7eZALaAdXpIgUYGmqQ3VBmbKqlGnEOuplZCBZAGZCn3kzZAb8xAfZAge7s9cUluV1uharOnBAJDXucX3ZBavpZB7ydEdgGiZBplXa60hgZD

var	accessToken = 'EAACEdEose0cBAAGBHkyjDvy1Bkv2MMmjaPghwif125tLChs5RrPml8Vg3t88VhuKZCAGQaL5mMZBvrcr1Ely6cMgjn61IoTxKhEr9LLBfXBGqOYXqZBZAFY9gHtCpCKyMLk604Jurg53Sop8v5Q7EBHlDZAkX0cRumjRx9J075wZDZD'

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


// getPhotosLink(accessToken, 10).then((data) => console.log(data));
// getPhotoIDs(accessToken, 10).then((data) => console.log(data));
// getAPhoto(accessToken, "1054981821244385").then((data) => console.log(data));
// getPosts(accessToken, 10).then((data) => console.log(data));