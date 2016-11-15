const TextEmotion = require('./alchemy.js')

// insert key here
var te = new TextEmotion('');

te.getEmotion("Detected language of the source text (text with fewer than 15 characters is assumed to be English")
  .then((data) => {
    console.log(data);
  }).catch((error) => {
    console.log(error);
  });

te.getEmotionFromAll(['Detected language of the source text (text with fewer than 15 characters is assumed to be English', 'hate my life', 'go die', 'i don"t wanna live'])
  .then((data) => {
    console.log(data);
  }).catch((error) => {
    console.log(error);
  });