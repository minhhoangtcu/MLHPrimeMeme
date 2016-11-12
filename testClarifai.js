let clarifai = require('./clarifai.js');

clarifai. getConcepts('https://samples.clarifai.com/metro-north.jpg')
.then((data) => console.log(data))
.catch((error) => console.log(error));