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
          resolve(); // ignore the error for now. Basically, we are passing back undefined
          // reject(JSON.stringify(err, null, 2));
        else
          resolve(response.docEmotions);
      });
    });
  }

  // input  : {message: text, time: time}
  // output : {text:time:anger:disgust:fear:joy:sadness}
  getEmotionObject(facebookPost) {
    return new Promise((resolve, reject) => {
      const text = facebookPost.message;
      var parameters = {text};

      this.alchemy_language.emotion(parameters, (err, response) => {
        if (err)
          resolve(); // ignore the error for now. Basically, we are passing back undefined
        else {
          let result = {};
          result.text = text;
          result.time = facebookPost.time;

          Object.keys(response.docEmotions).forEach((key) => {
            result[key] = response.docEmotions[key];
          });

          resolve(result);
        }
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
          let sum = data.map((sentiment) => sentiment.joy)
          resolve(sum);
        })
        .catch((error) => {
          reject(error);
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
          let sum = data
                      .filter((sentiment) => sentiment) // if not null
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