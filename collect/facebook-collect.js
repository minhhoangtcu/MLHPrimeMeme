const FB = require('fb');

class CollectFacebook {

  constructor(accessToken) {
    FB.options({accessToken: accessToken});
  }

  /**
  * Get the url and created time of a photo provided its id (Node). You should never use this,
  * because this is just the helper function for getPhotosInfo
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

  /**
   * Get a certain number of photos IDs of the user. You should never use this, 
   * because this is just the helper function for getPhotosInfo.
   */
  getPhotoIDs(size) {
    return new Promise((resolve, reject) => {
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

  /**
   * Get the first n info of user's photos. For n be determined by 'size'
   */
  getPhotosInfo(size) {
    return new Promise((resolve, reject) => {
      this.getPhotoIDs(size).then((ids) => {

        let promises = []

        ids.forEach((id) => {
          let temp = this.getAPhoto(id);
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
   * Get the message and created date of many user posts. The function may not return the correct number of posts!
   *
   * @return: {message: text, time: time} for time in the format similarly to this: 2016-11-11T18:54:36+0000
   */
  getPostsOfUser(size) {
    return new Promise((resolve, reject) => {
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
                .filter((post) => post.message) // filter out post that has no message
                .map( (post) => { return {'message': post.message, 'time': post.created_time} } )
            )
          }
        }
      );
    })
  }
}

module.exports = CollectFacebook;