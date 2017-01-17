const TextEmotion = require('./alchemy.js')

// insert key here
var te = new TextEmotion('');

te.getEmotion("trời ơi là trời sao không dịch đc tiếng Việt hả trời")
  .then((data) => {
    console.log("\n> Get single emotion from a single text");
    console.log(data);
  }).catch((error) => {
    console.log(error);
  });

// te.getAverageEmotionFromAll(['Detected language of the source text (text with fewer than 15 characters is assumed to be English', 'hate my life', 'go die', 'i don"t wanna live'])
te.getAverageEmotionFromAll(['tiếng Việt, rất dài, hú hú', 'hate my life', 'go die', 'i don"t wanna live'])
  .then((data) => {
    console.log("\n> Get Average Emotion From All");
    console.log(data);
  }).catch((error) => {
    console.log(error);
  });

te.getEmotionFromAll(['Detected language of the source text (text with fewer than 15 characters is assumed to be English', 'hate my life', 'go die', 'i don"t wanna live'])
  .then((data) => {
    console.log("\n> Get Emotion From All");
    console.log(data);
  }).catch((error) => {
    console.log(error);
  });

te.getEmotionObject({message: "Detected language of the source text (text with fewer than 15 characters is assumed to be English", time: "12PM"})
  .then((data) => {
    console.log("\n> Emotion Object\n");
    console.log(data);
  }).catch((error) => {
    console.log(error);
  });