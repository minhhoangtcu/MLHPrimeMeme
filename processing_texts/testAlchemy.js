var alchemy = require('./alchemy.js')

alchemy.getEmotion("Detected language of the source text (text with fewer than 15 characters is assumed to be English")
	.then((data) => {
		console.log(data);
	}).catch((error) => {
		console.log(error);
	});