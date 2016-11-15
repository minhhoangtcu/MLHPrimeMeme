require('dotenv').config();

const RapidAPI = new require('rapidapi-connect');
const rapid = new RapidAPI('MLHPrimeMeme', process.env.RAPID_API_TOKEN);
const MICROSOFT_EMOTION_KEY = process.env.MICROSOFT_EMOTION_KEY;

/* Get an array of emotions
 * - url: link the the image
 */
function getEmotionFromImage(url) {
	return new Promise( (resolve, reject) => {
		rapid.call('MicrosoftEmotionAPI', 'getEmotionRecognition', { 
		'image': url,
		'subscriptionKey': MICROSOFT_EMOTION_KEY
 
		}).on('success', (payload) => {
			let average = (payload.map(face => face.scores.happiness).reduce( (acc, cur) => acc + cur, 0)) / payload.length;
			resolve( average );
		}).on('error', (payload) => {
			reject(payload);
		});
	});
}

exports.getEmotionFromImage = getEmotionFromImage;