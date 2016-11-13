// const RapidAPI = new require('rapidapi-connect');
// const rapid = new RapidAPI('JiboUp', '9bb11e09-8d1f-41b8-8901-6871186bf5eb');
const FB = require('fb');

// var	accessToken = 'EAACEdEose0cBAFUZBCyY2WUcMOJb96ronU38fjeZCBkwAYbvSWZAQH74Xzv8FdBZAqLmy0rnX7NrjuKKLZBJUwZBCOAFQPLXAoP6X5fHXhK4F4ZC8GJRooMNHHZBg5f3spobZCZBfBZAFy9QwOZBbf0kkatbvYGRSJUyCz1tCoxljal9HAZDZD'


function getPhotosLink(accessToken) {
	return new Promise((resolve, reject) => {
		FB.options({accessToken: accessToken});
		FB.api(
			'/me',
			'GET',
			{"fields":"id,name,photos{link}"},
			function(response) {
				if (!response || response.error) {
					reject(response.error);
				} else {
					resolve(response.photos.data.map((photo) => photo.link));
				}
			}
		);
	})
}

function getPosts(accessToken) {
	return new Promise((resolve, reject) => {
		FB.options({accessToken: accessToken});
		FB.api(
			'/me',
			'GET',
			{"fields":"id,name,posts.limit(60)"},
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

exports.getPhotosLink = getPhotosLink;
exports.getPosts = getPosts;


// getPhotosLink(accessToken).then((data) => console.log(data));
// getPosts(accessToken).then((data) => console.log(data));


// FB.init({
// 	appId      : '1114906558583574',
// 	status     : true,
// 	xfbml      : true,
// 	version    : 'v2.7' // or v2.6, v2.5, v2.4, v2.3
// });



// graph.setAccessToken(accessToken);

// function getTimeline(accessToken) {
// 	return new Promise((resolve, reject) => {
// 		rapid.call('FacebookGraphAPI', 'getUsersFeed', { 
// 			'access_token': accessToken,
// 			'user_id': ''
// 		}).on('success', (payload)=>{
// 			console.log("yeh success")
// 			resolve(payload)
// 		}).on('error', (payload)=>{
// 			console.log(payload)
// 			console.log("o no failed")
// 			reject(payload)
// 		})
// 	})
// }


// function getPostsOfUser(accessToken) {
// 	return new Promise((resolve, reject) => {
// 		getTimeline(accessToken).then(
// 			function(timeline){
// 				timelineJson = JSON.parse(timeline).data
// 				resolve(
// 					timelineJson.filter( 
// 						(post) => post.message
// 					).map(
// 						(post) => post.message
// 			))}
// 		)
// 	}
// )}

// //returns photos as urls
// function getPhotosOfUser(accessToken) {
	
// 	return new Promise((resolve, reject) => {

		
// 		var photos = [];
// 		var promises = [];

// 		getAlbumsOfUser(accessToken).then((albums) => {
// 			albums.slice(0, 10).forEach((album) => {
// 				promises.push(getPhotosFromAlbum(accessToken, album))
// 			})

// 			Promise.all(promises)
// 			.then((data) => {
// 				resolve(data.reduce(function(a, b) { 
// 					return a.concat(b);
// 				}, []).slice(0, 10))
// 			})
// 		})
// 	})
// }


// function getUserAlbums(accessToken) {
// 	return new Promise((resolve, reject) => {
// 		rapid.call('FacebookGraphAPI', 'getUserAlbums', { 
// 			'access_token': accessToken,
// 			'profile_id': ''
// 		}).on('success', (payload)=>{
// 			// console.log("yeh success")
// 			resolve(payload)
// 		}).on('error', (payload)=>{
// 			// console.log(payload)
// 			// console.log("o no failed")
// 			reject(payload)
// 		})
// 	})
// }


// function getAlbumsOfUser(accessToken){
// 	return new Promise((resolve, reject) => {
// 		getUserAlbums(accessToken).then(
// 			function(userAlbums){
// 				userAlbumsJson = JSON.parse(userAlbums).data
// 				resolve(userAlbumsJson.map((album) => album.id))
// 			}
// 		)
// 	})
// }

// function getAlbumPhotos(accessToken, albumID) {
// 	return new Promise((resolve, reject) => {
// 		rapid.call('FacebookGraphAPI', 'getAlbumPhotos', { 
// 			'access_token': accessToken,
// 			'album_id': albumID
// 		}).on('success', (payload) =>{
// 			resolve(payload)
// 		}).on('error', (payload) =>{
// 			reject(payload)
// 		})
// 	})
// }


// function getPhotosFromAlbum(accessToken, albumID){
// 	return new Promise((resolve, reject) => {
// 		getAlbumPhotos(accessToken, albumID).then(
// 			function(albumPhotos){
// 				// console.log(albumPhotos)
// 				albumPhotosJson = JSON.parse(albumPhotos).data
// 				resolve(albumPhotosJson.map((photo) => photo.id))
// 			}
// 		)
// 	})
// }