const RapidAPI = new require('rapidapi-connect');

class ImageFaceEmotion {

  constructor(rapidKey, microsoftKey) {
    this._rapidKey = rapidKey;
    this._microsoftKey = microsoftKey;
    this.rapid = new RapidAPI('MLHPrimeMeme', rapidKey);
  }

  /* Returns a Promise with the overall happiness of the faces in the provided image.
  *
  * - url: link the the image
  */
  getEmotionFromImage(url) {
    return new Promise( (resolve, reject) => {

      this.rapid
        .call('MicrosoftEmotionAPI', 'getEmotionRecognition', { 
          'image': url,
          'subscriptionKey': this._microsoftKey
        })
        .on('success', (payload) => {

          if (payload.length === 0) {
            reject(new Error('Cannot find any face within the picture'));
          }

          let average = (payload.map(face => face.scores.happiness).reduce( (acc, cur) => acc + cur, 0)) / payload.length;
          resolve(average);
        })
        .on('error', (payload) => {
          reject(payload);
        });

    });
  }

}

module.exports = ImageFaceEmotion;