const watson = require('watson-developer-cloud');

class TextEmotion {

  constructor(key) {
    this.alchemy_language = watson.alchemy_language({api_key: key});
  }

  getEmotion(text) {
    return new Promise((resolve, reject) => {
      var parameters = {text}

      this.alchemy_language.emotion(parameters, (err, response) => {
        if (err)
          reject(err);
        else
          resolve(response.docEmotions);
      });
    });
  }

  // output: {text: text, emotion: {anger:disgust:fear:joy:sadness}}
  getEmotionObject(text) {
    return new Promise((resolve, reject) => {
      var parameters = {text}

      this.alchemy_language.emotion(parameters, (err, response) => {
        if (err)
          reject(err);
        else {
          let result = {};
          result.text = text;

          Object.keys(response.docEmotions).forEach((key) => {
            result[key] = response.docEmotions[key];
          });

          resolve(result);
        }
      });
    });
  }

  getAverageEmotionFromAll(arrayOfTexts) {
    return new Promise( (resolve, reject) => {

      var sentiments = [];

      arrayOfTexts.forEach((text) => {
        sentiments.push(this.getEmotion(text));
      });

      Promise
        .all(sentiments) // after this we get an array of JSON
        .then((data) => {
          let sum = data.map((sentiment) => sentiment.joy)
          resolve(sum);
        })
        .catch((error) => {
          reject(error);
        });

    });
  }

  getEmotionFromAll(arrayOfTexts) {
    return new Promise( (resolve, reject) => {

      var sentiments = [];

      arrayOfTexts.forEach((text) => {
        sentiments.push(this.getEmotion(text));
      });

      Promise
        .all(sentiments) // after this we get an array of JSON
        .then((data) => {
          let sum = data
                      .map((sentiment) => sentiment.joy)
                      .reduce((acc, cur) => parseFloat(acc) + parseFloat(cur));

          resolve(sum / data.length);
        })
        .catch((error) => {
          reject(error);
        });

    });
  }
}

module.exports = TextEmotion;