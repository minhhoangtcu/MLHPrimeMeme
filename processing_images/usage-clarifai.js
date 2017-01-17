const ImageHash = require('./clarifai.js');

// insert keys
var clarifai = new ImageHash('', '');

// replace url
clarifai.getConcepts('https://samples.clarifai.com/metro-north.jpg')
  .then((data) => console.log(data))
  .catch((error) => console.log(error));