let Clarifai = require('clarifai');

class ImageHash {

  constructor(clientId, clientSecret) {
    this.app = new Clarifai.App(
      clientId,
      clientSecret
    );
  }

  /* Returns a promise with all concepts from the provided url to an image.
   * 
   * - url: link to the image
   */
  getConcepts(url) {

    return new Promise((resolve, reject) => {

      this.app.models.predict(Clarifai.GENERAL_MODEL, url)
        .then(function(response) {
          resolve(
            response.data.outputs[0].data.concepts
              .map((concept) => concept.name)
          );
        })
        .catch(function(err) {
          reject(err);
        });
    })

  }
}

module.exports = ImageHash;

