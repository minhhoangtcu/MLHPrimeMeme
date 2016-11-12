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
			// return the average of happiness of all the faces
			resolve( (payload.map(face => face.scores.happiness).reduce( (acc, cur) => acc + cur, 0)) / payload.length);
		}).on('error', (payload) => {
			reject(payload);
		});
	});
}

getEmotionFromImage('https://scontent.xx.fbcdn.net/v/t1.0-9/14642172_10154063485737358_7879666446566034790_n.jpg?oh=ea867ab487ac2c87c41a1e7c941818da&oe=58944FD7')
.then( (data) =>{
	console.log(data);
}).catch( (error) => {
	console.log(error);
});

exports.getEmotionFromImage = getEmotionFromImage;