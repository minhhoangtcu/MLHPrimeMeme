/* jshint node: true, devel: true */
'use strict';

require('dotenv').config();

const 
  bodyParser = require('body-parser'),
  crypto = require('crypto'),
  express = require('express'),
  https = require('https'),  
  request = require('request'),
  Wit = require('node-wit').Wit,
  log = require('node-wit').log,
  speeches = require('./speeches.js'),
  alchemy = require('./alchemy.js'),
  emotion = require('./emotion.js'),
  clarifai = require('./clarifai.js'),
  graph = require('./facebook').graph,
  fbCollect = require('./facebook-collect.js'),
  jokes = require('./jokes.js');

/*
 * Get the secret tokens/keys
 */
const APP_SECRET = process.env.MESSENGER_APP_SECRET;
const VALIDATION_TOKEN = process.env.MESSENGER_VALIDATION_TOKEN;
const PAGE_ACCESS_TOKEN = process.env.MESSENGER_PAGE_ACCESS_TOKEN;
const SERVER_URL = process.env.SERVER_URL;
const WIT_TOKEN = process.env.WIT_SERVER_TOKEN;

/*
 * Set up server
 */
var app = express();
app.set('port', process.env.PORT);
app.set('view engine', 'ejs');
app.use(bodyParser.json({ verify: verifyRequestSignature }));
app.use(express.static('public'));

/*
 * Set up routes
 */
const facebookRoutes = require('./facebook').router;
app.use('/', facebookRoutes);

/* 
 * Container variables
 */
 var recentPosts = [];
 var recentImagesLinks = [];
 var currentHappiness = 0;

// ---------------------------------------------------------------------------
// wit.ai Code

const actions = {
  send(request, response) {
    const {sessionId, context, entities} = request;
    const {text, quickreplies} = response;
    return new Promise(function(resolve, reject) {
      console.log('user said...', request.text);
      console.log('sending...', JSON.stringify(response));
      return resolve();
    });
  },
};

const wit = new Wit({
  accessToken: WIT_TOKEN,
  actions,
  logger: new log.Logger(log.INFO)
});

/* Send message to bot
 * 
 * - mess: text to send to bot
 * - context: previous context. JSON object.
 */
function sendMessToBot(mess, context) {
	console.log("SEND BOT: ", mess);
	return wit.message(mess, context)
}

// ---------------------------------------------------------------------------
// Facebook Collecting Code

app.get('/loggedIn', (req, res) => {
  // serve an auto close page
  res.send('Successfully Logged In!!!');

  let senderID = req.query.senderID;
  sendTextMessage(senderID, "Sucessfully logged in!")

  const facebookToken = graph.getAccessToken();

  getSentiment(senderID, facebookToken);
  getImages(senderID, process.env.FACEBOOK_CHEAT);
});

function getSentiment(senderID, facebookToken) {

  sendTextMessage(senderID, "Please wait for Jibo to collect your data.");

  fbCollect.getPostsOfUser(facebookToken, 5)
  .then((data) => {
    sendTextMessage(senderID, "I have finished collecting your Facebook posts!");

    // Store in global
    recentPosts = data;

    alchemy.getEmotionFromAll(data)
    .then((average) => currentHappiness = average)
    .catch((error) => console.log("Cannot get sentiment from texts: ", error));

  });
}

function getImages(senderID, facebookToken) {

  // collect images
  fbCollect.getPhotosLink(facebookToken, 10)
  .then((links) => {
    sendTextMessage(senderID, "I have finished collecting your Facebook images!");

    recentImagesLinks = links;
    // console.log(JSON.stringify(recentImagesLinks, null, 2));

  })
  .catch((error) => {
    console.log(error);
  });

}

// ---------------------------------------------------------------------------
// Routes for Jibo

app.post('/greet', (req, res) => {

  let messageText = req.body.data;
  console.log("> Received text from Jibo: ", messageText);

  sendMessToBot(messageText)
  .then((data) => {

    let intent = data.entities.intent[0].value;
    console.log("Intent from FB: ", intent);

    switch (intent) {
      case 'welcome':
        // get concepts to prepare for response
        clarifai.getConcepts();

        // response
        if (currentHappiness != 0 && currentHappiness < 0.4) {
          res.send({type: "text", data: speeches.getRandomCheer(0)});
        } else if (currentHappiness != 0) {
          res.send({type: "text", data: speeches.getRandomCelebration(0)});
        } else {
          res.send({type: "text", data: "Welcome home!"});
        }
        break;

      case 'joke':

        jokes.getJoke()
        .then((joke) => {
          res.send({type: "text", data: joke});
        }).catch((error) => {
          console.log(error);
        });

        break;

      default:
        res.send({type: "error"});
    }

    res.status(200)
  })
  .catch((error) =>{
    console.log(error);
  });

})

// ---------------------------------------------------------------------------
// Messenger Code

app.get('/webhook', function(req, res) {
  if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === VALIDATION_TOKEN) {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);          
  }  
});

app.post('/webhook', function (req, res) {
  const data = req.body;

  // Make sure this is a page subscription
  if (data.object === 'page') {

    // Iterate over each entry
    // There may be multiple if batched
    data.entry.forEach(function(pageEntry) {
      var pageID = pageEntry.id;
      var timeOfEvent = pageEntry.time;

      // Iterate over each messaging event
      pageEntry.messaging.forEach(function(messagingEvent) {
        if (messagingEvent.message) {
          receivedMessage(messagingEvent);
        } else {
          // console.log("Webhook received unknown messagingEvent");
          // console.log("Webhook received unknown messagingEvent: ", messagingEvent);
        }
      });
    });

    res.sendStatus(200);
  }
});

function receivedMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  if (message.is_echo) {
    // Just don't do anything with the echo for now
    // console.log("Received echo for message %s and app %d with metadata %s", messageId, appId, metadata);
    return;
  }

  console.log("Received message for user %d and page %d at %d with message:", 
    senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));

  var messageId = message.mid;
  var appId = message.app_id;
  var metadata = message.metadata;

  // You may get a text or attachment but not both
  var messageText = message.text;
  var messageAttachments = message.attachments;
  var quickReply = message.quick_reply;

  if (quickReply) {
    var quickReplyPayload = quickReply.payload;
    console.log("Quick reply for message %s with payload %s",
      messageId, quickReplyPayload);

    sendTextMessage(senderID, "Quick reply tapped");
    return;
  }

  if (messageText) {

    const facebookToken = graph.getAccessToken();

    // If we receive a text message, check to see if it matches any special
    // keywords and send back the corresponding example. Otherwise, just echo
    // the text we received.
    switch (messageText) {
      case 'happiness':
        if (currentHappiness != 0) {
          sendTextMessage(senderID, "Current happniess: " + currentHappiness);
        }
        break;

      case 'recent':
        if (recentPosts.length != 0) {

          sendTextMessage(senderID, "Here are your most three recent posts");

          setTimeout(() => {
            recentPosts.slice(0,3).forEach( (post) => {
              sendTextMessage(senderID, post);
            });  
          }, 500);

        }
        break;

      case 'help':

        break;

      case 'commentimage':
        send
        break;

      case 'collect':

        if (facebookToken) {
          getImages(senderID, process.env.FACEBOOK_CHEAT);
          getSentiment(senderID, facebookToken);
        } else {
          sendTextMessage(senderID, "Please click this link to allow us to use your Facebook posts and images: " + process.env.FACEBOOK_LOGIN_URL + "?senderID=" + senderID)
        }

        break;

      default:

      	sendMessToBot(messageText)
      	.then((data) => {
      		let intent = data.entities.intent[0].value;
      		console.log(JSON.stringify(data, null, 2));
      	})
      	.catch((error) =>{
      		console.log(error);
      	});

        sendTextMessage(senderID, messageText); // echo back
    }
  } else if (messageAttachments) {

  	let imageUrl = messageAttachments[0]['payload']['url'];
  	let imageAllData = [emotion.getEmotionFromImage(imageUrl),
  						clarifai.getConcepts(imageUrl)];

  	Promise.all(imageAllData).then((data) => {
  		console.log(data);
  	});

    // sendTextMessage(senderID, "Message with attachment received");
  }
}

/*
 * Send a text message using the Send API.
 *
 */
function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText,
      metadata: "DEVELOPER_DEFINED_METADATA"
    }
  };

  callSendAPI(messageData);
}

/*
 * Send an image using the Send API.
 *
 */
function sendImageMessage(recipientId, imageURL) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "image",
        payload: {
          url: imageURL
        }
      }
    }
  };

  callSendAPI(messageData);
}

/*
 * Call the Send API. The message data goes in the body. If successful, we'll 
 * get the message id in a response 
 *
 */
function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      if (messageId) {
        console.log("Successfully sent message with id %s to recipient %s", 
          messageId, recipientId);
      } else {
      console.log("Successfully called Send API for recipient %s", 
        recipientId);
      }
    } else {
      console.error("Failed calling Send API", response.statusCode, response.statusMessage, body.error);
    }
  });  
}

/*
 * Verify that the callback came from Facebook. Using the App Secret from 
 * the App Dashboard, we can verify the signature that is sent with each 
 * callback in the x-hub-signature field, located in the header.
 *
 * https://developers.facebook.com/docs/graph-api/webhooks#setup
 *
 */
function verifyRequestSignature(req, res, buf) {
  var signature = req.headers["x-hub-signature"];

  if (!signature) {
    // For testing, let's log an error. In production, you should throw an 
    // error.
    console.error("Couldn't validate the signature.");
  } else {
    var elements = signature.split('=');
    var method = elements[0];
    var signatureHash = elements[1];

    var expectedHash = crypto.createHmac('sha1', APP_SECRET)
                        .update(buf)
                        .digest('hex');

    if (signatureHash != expectedHash) {
      throw new Error("Couldn't validate the request signature.");
    }
  }
}

/*
 * Print out all info
 */
 function printDebugInfo() {
 	console.log("App secret: ", APP_SECRET);
 	console.log("Validation token: ", VALIDATION_TOKEN);
 	console.log("Page access token: ", PAGE_ACCESS_TOKEN);
 	console.log("Server URL: ", SERVER_URL);
 }

// Start server
// Webhooks must be available via SSL with a certificate signed by a valid 
// certificate authority.
app.listen(app.get('port'), function() {
	console.log('Node app is running on port', app.get('port'));
  	// printDebugInfo();
});
