let Clarifai = require('clarifai');

// TODO: can you hide all your keys.... :(
let clientId = 'NhJeIZ_rTZenBuYEqP9i3zDuhGWC3jJMynEjiPIj';
let clientSecret = 'Kz2yNlKMp-Ykd8Jjmen2F1qGSiqNSDiN3pErIn58';

let app = new Clarifai.App(
	clientId,
	clientSecret
);

// predict the contents of an image by passing in a url

function getConcepts(imageURL) {
	return new Promise((resolve, reject) => {
		app.models.predict(Clarifai.GENERAL_MODEL, imageURL)
		.then(function(response) {
				// console.log('success');
				// var data = JSON.stringify(response.data);
			resolve(
				response.data.outputs[0].data.concepts
				.map((concept) => concept.name)
			);
		})
		.catch(function(err) {
			reject(err);
		});
	})
}

exports.getConcepts = getConcepts;

