const TextEmotion = require('./alchemy.js')

// insert key here
var te = new TextEmotion('784a43dd4fec280f893f6cb6222ca1ab3d2c9b25');

te.getEmotion("Detected language of the source text (text with fewer than 15 characters is assumed to be English")
  .then((data) => {
    console.log(data);
  }).catch((error) => {
    console.log(error);
  });

te.getAverageEmotionFromAll(['Detected language of the source text (text with fewer than 15 characters is assumed to be English', 'hate my life', 'go die', 'i don"t wanna live'])
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