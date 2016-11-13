const FB = require('fb');

//var	accessToken = 'EAACEdEose0cBAI45IL2dnC7jwAyAh1gW6JRFDW1WZBz1lxGiurlAclfLelfcVBawJ5GZBqZCv2Iw09dSUco0PotfZAhrLMFg44A4qi5NiMZBc0tuUV2cXDtpSm7LiHOmVmc42ZCAqAuSxkt01ZCT3kgwdZBMUWwS25VYLfkPXup6YgZDZD'

function getPhotosLink(accessToken, size) {
	return new Promise((resolve, reject) => {
		FB.options({accessToken: accessToken});
		FB.api(
			'/me',
			'GET',
			{"fields":`id,name,photos.limit(${size}){link}`},
			function(response) {
				console.log(response);
				if (!response || response.error) {
					reject(response.error);
				} else {
					resolve(response.photos.data.map((photo) => photo.link));
				}
			}
		);
	})
}

function getPosts(accessToken, size) {
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

exports.getPostsOfUser = getPosts;
exports.getPhotosLink = getPhotosLink;


// getPhotosLink(accessToken, 10).then((data) => console.log(data));
// getPosts(accessToken, 10).then((data) => console.log(data));