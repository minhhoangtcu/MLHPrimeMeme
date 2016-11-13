require('dotenv').config();

const RapidAPI = new require('rapidapi-connect');
const rapid = new RapidAPI('JiboUp', '9bb11e09-8d1f-41b8-8901-6871186bf5eb');
const graph = require('fbgraph');
const fbConfig = require("./facebookConfig.js").facebookConfig;
const express   = require('express');
var router = express.Router();

var accessToken = '';

function getPostsOfUser(accessToken) {

	return new Promise((resolve, reject) => {

	posts = []
	getTimeline(accessToken)
	.then( (timeline) => {
		timelineJson = JSON.parse(timeline).data

		// filter out non mess and use mess
		resolve( timelineJson
					.filter((post) => post.message)
					.map((post) => post.message)
		)

	}).catch( (error) => {
		console.log(error);
	});
})}

function getTimeline(accessToken) {
	return new Promise((resolve, reject) => {
		rapid.call('FacebookGraphAPI', 'getUsersFeed', { 
			'access_token': accessToken,
			'user_id': ''
		}).on('success', (payload)=>{
			console.log("yeh success")
			resolve(payload)
		}).on('error', (payload)=>{
			console.log("o no failed")
			reject(payload)
		})
	})
}

router.get('/auth/facebook', function(req, res) {

	if (!req.query.code) {
    var authUrl = graph.getOauthUrl({
        "client_id":     process.env.FACEBOOK_CLIENT_ID, 
		"redirect_uri":  fbConfig.redirect_uri,
      	"scope":         fbConfig.scope
    });

    if (!req.query.error) { //checks whether a user denied the app facebook login/permissions
      res.redirect(authUrl);
    } else {  //req.query.error == 'access_denied'
      res.send('access denied');
    }
    return;
  }

  // code is set
  // we'll send that and get the access token
  graph.authorize({
  	"client_id":      process.env.FACEBOOK_CLIENT_ID, 
  	"redirect_uri":   fbConfig.redirect_uri, 
  	"client_secret":  process.env.FACEBOOK_CLIENT_SECRET, 
  	"code":           req.query.code
  }, function (err, facebookRes) {

  	accessToken = facebookRes.access_token;
  	console.log(accessToken);

  	res.redirect('/loggedIn');
  });

});

router.get('/loggedIn', function(req, res) {
  res.send("Successfully Logged In!");
});

// getPostsOfUser(accessToken).then((data) => console.log(data));

module.exports = router;
exports.accessToken = accessToken;
exports.getPostsOfUser = getPostsOfUser;