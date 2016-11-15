var watson = require('watson-developer-cloud');

var alchemy_language = watson.alchemy_language({
  api_key: '784a43dd4fec280f893f6cb6222ca1ab3d2c9b25'
});

function getEmotion(text) {
	return new Promise((resolve, reject) => {
		var parameters = {text}

		alchemy_language.emotion(parameters, function (err, response) {
		if (err)
			reject(err);
		else
			resolve(response.docEmotions, null, 2);
		});
	});
}

function getEmotionFromAll(arrayOfTexts) {
	return new Promise( (resolve, reject) => {

		var sentiments = [];

		arrayOfTexts.forEach((text) => {
			sentiments.push(getEmotion(text));
		});

		Promise.all(sentiments) // after this we get an array of JSON
		.then((data) => {
			let sum = data.map((sentiment) => sentiment.joy)
							  .reduce((acc, cur) => parseFloat(acc) + parseFloat(cur));
			resolve(sum / data.length);
		})
		.catch((error) => {
			reject(error);
		});

	});
}

exports.getEmotionFromAll = getEmotionFromAll;