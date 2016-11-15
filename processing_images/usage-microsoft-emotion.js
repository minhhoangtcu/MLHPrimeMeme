const ImageFaceEmotion = require('./microsoft-emotion.js');

// insert keys
var ifm = new ImageFaceEmotion('', '');

// insert url
ifm.getEmotionFromImage('')
  .then((average) => {
    console.log(average);
  })
  .catch((error) => {
    console.log(error);
  });