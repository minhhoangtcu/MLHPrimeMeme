require('dotenv').config();

const graph = require('fbgraph');
const fbConfig = require("./facebookConfig.js").facebookConfig;
const express   = require('express');
var router = express.Router();

router.get('/auth/facebook', function(req, res) {

	let senderID = req.query.senderID;

	if (!req.query.code) {
		var authUrl = graph.getOauthUrl({
			"client_id":     process.env.FACEBOOK_CLIENT_ID, 
			"redirect_uri":  fbConfig.redirect_url + "?senderID=" + senderID,
			"scope":         fbConfig.scope
		});

	    if (!req.query.error) { //checks whether a user denied the app facebook login/permissions
	    	console.log("redirecting");
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
		"redirect_uri":   fbConfig.redirect_url + "?senderID=" + senderID, 
		"client_secret":  process.env.FACEBOOK_CLIENT_SECRET, 
		"code":           req.query.code
	}, function (err, facebookRes) {
		
		let accessToken = facebookRes.access_token;
		graph.setAccessToken(accessToken);

		res.redirect('/loggedIn' + "?senderID=" + senderID);
	});

});

module.exports = {router, graph};