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
			resolve(JSON.stringify(response.docEmotions, null, 2));
		});
	});
}

exports.getEmotion = getEmotion;