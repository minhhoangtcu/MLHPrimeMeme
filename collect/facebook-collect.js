const FB = require('fb');

class CollectFacebook {

  constructor(accessToken) {
    FB.options({accessToken: accessToken});
  }

  /**
  * Get the url and created time of a photo provided its id (Node).
  *
  * @return: {link: url, time: time} for time in the format similarly to this: 2016-11-11T18:54:36+0000
  */
  getAPhoto(id) {
    return new Promise((resolve, reject) => {
      FB.api(
        id,
        'GET',
        {'fields': 'images,created_time'},
        (response) => {
          if (response && !response.error) {
            resolve(
              {link: response.images[0].source,
               time: response.created_time}
               );
          } else {
            reject(response.error);
          }
        }
      );
    });
  }
}

/**
 * Get the first n info of user's photos. For n be determined by 'size'
 */
function getPhotosInfo (accessToken, size) {
  return new Promise((resolve, reject) => {
    getPhotoIDs(accessToken, size).then((ids) => {

      let promises = []

      ids.forEach((id) => {
        let temp = getAPhoto(accessToken, id);
        promises.push(temp)
      })

      Promise
        .all(promises)
        .then((data) => {
          resolve(data)
        })
        .catch((error) => {
          reject(error)
        })
    })
  })
}

/**
 * Get a certain number of photos IDs of the user.
 */
function getPhotoIDs(accessToken, size) {
  return new Promise((resolve, reject) => {
    FB.options({accessToken: accessToken});
    FB.api(
      '/me',
      'GET',
      {"fields":`photos.limit(${size}{id})`},
      (response) => {
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
exports.getPhotosInfo = getPhotosInfo;
exports.getPhotoIDs = getPhotoIDs;
module.exports = CollectFacebook;