/* jshint node: true, devel: true */
'use strict';

// Imported modules
require('dotenv').config();
const bodyParser = require('body-parser');
const crypto = require('crypto');
const express = require('express');
const https = require('https');
const request = require('request');
const Wit = require('node-wit').Wit;
const log = require('node-wit').log;

// Helpers
const graph = require('./routes/facebook').graph;
const fbConfig = require("./routes/facebookConfig.js").facebookConfig;

// Helper modules
const speeches = require('./chat/speeches.js');
const jokes = require('./chat/jokes.js');
const csvGenerator = require('./collect/csv-generator.js');

// Custom classes
const TextEmotion = require('./processing_texts/alchemy.js');
const ImageFaceEmotion = require('./processing_images/microsoft-emotion.js');
const ImageHash = require('./processing_images/clarifai.js');
const CollectFacebook = require('./collect/facebook-collect.js');

// Secret tokens/keys
const APP_SECRET = process.env.MESSENGER_APP_SECRET;
const VALIDATION_TOKEN = process.env.MESSENGER_VALIDATION_TOKEN;
const PAGE_ACCESS_TOKEN = process.env.MESSENGER_PAGE_ACCESS_TOKEN;
const WIT_TOKEN = process.env.WIT_SERVER_TOKEN;
const WATSON_KEY = process.env.WATSON_KEY;
const RAPID_API_TOKEN = process.env.RAPID_API_TOKEN;
const MICROSOFT_EMOTION_KEY = process.env.MICROSOFT_EMOTION_KEY;
const CLARIFAI_CLIENT_ID = process.env.CLARIFAI_CLIENT_ID;
const CLARIFAI_CLIENT_SECRET = process.env.CLARIFAI_CLIENT_SECRET;

// Init custom classes
var fbCollect = '';
var alchemy = new TextEmotion(WATSON_KEY);
var emotionImage = new ImageFaceEmotion(RAPID_API_TOKEN, MICROSOFT_EMOTION_KEY);
var clarifai = new ImageHash(CLARIFAI_CLIENT_ID, CLARIFAI_CLIENT_SECRET);

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
const facebookRoutes = require('./routes/facebook').router;
app.use('/', facebookRoutes);

app.get('/loggedIn', (req, res) => {
  // serve an auto close page
  res.send('Successfully Logged In!!!');

  let senderID = req.query.senderID;
  sendTextMessage(senderID, "Sucessfully logged in!")

  const facebookToken = graph.getAccessToken();
  fbCollect = new CollectFacebook(facebookToken); // make this global

  getSentiment(senderID);
  getImages(senderID);
  getAllSentiment(senderID);
});

/* 
 * Container variables
 */
 var recentPosts = [];
 var recentImagesLinks = [];
 var currentHappiness = 0;
 var recentAttachment = "";

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
	console.log("Send to Wit.ai: ", mess);
	return wit.message(mess, context)
}

// ---------------------------------------------------------------------------
// Facebook Collecting Code

// Collect user's status updates and store back in global
function getSentiment(senderID) {

  fbCollect.getPostsOfUser(10)
    .then((data) => {
      sendTextMessage(senderID, "I have finished collecting your Facebook posts!");

      data = data.map((post) => post.message);

      // Store back in global
      recentPosts = data;

      alchemy.getAverageEmotionFromAll(data)
        .then((average) => currentHappiness = average)
        .catch((error) => console.log("Cannot get sentiment from texts: ", error));

    })
    .catch ((error) => {
      console.log(error);
    });
}

function getImages(senderID) {

  // collect images
  fbCollect.getPhotosInfo(10)
    .then((links) => {
      sendTextMessage(senderID, "I have finished collecting your Facebook images!");
      recentImagesLinks = links;
    })
    .catch((error) => {
      console.log(error);
    });

}

function getAllSentiment(senderID) {

  fbCollect.getPostsOfUser(999)
    .then((data) => {
      // data will be [{message: text, time: time}]
      sendTextMessage(senderID, "I have finished collecting ALL of your Facebook posts!");

      var sentiments = [];

      data.forEach((post) => {
        sentiments.push(alchemy.getEmotionObject(post));
      });

      Promise
        .all(sentiments)
        .then((emotions) => {
          // data is now an array of [{text:time:anger:disgust:fear:joy:sadness}]
          csvGenerator.generateCSV('text-sentiment', emotions);
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch ((error) => {
      console.log(error);
    });
}

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

  // console.log("Received message for user %d and page %d at %d with message:", senderID, recipientID, timeOfMessage);
  // console.log(JSON.stringify(message));
  console.log(`Received mess from ${senderID}: "${message.text}"`);

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

        sendTextMessage(senderID,
        "collect - request user's permission\n" +
        "happiness - show current happiness level\n" +
        "recent - show recent posts\n" +
        "commentimage - show stats for the first image");

        break;

      case 'commentimage':

        if (recentImagesLinks.length != 0) {

          let imageUrl = recentImagesLinks[0];

          let imageAllData = [emotionImage.getEmotionFromImage(imageUrl),
                              clarifai.getConcepts(imageUrl)];

          Promise.all(imageAllData).then((data) => {


            sendImageMessage(sender, imageUrl);

            if (data[0][0]) {
              sendTextMessage(senderID, "Happiness level: " + data[0][0]);
            } else {
              sendTextMessage(senderID, "Cannot analyze the sentiment of provided image.");
            }

            let hashes = `Hashes: ${data[1][0]} ${data[1][1]} ${data[1][2]} ${data[1][3]}`
            sendTextMessage(senderID, hashes)
          });

          sendImageMessage(senderID, imageUrl);

        }

        break;

      case 'hi':

        if (facebookToken) {
          sendTextMessage(senderID, 'You have already given your permission to me.')
        } else {
          sendTextMessage(senderID, `Hello Minh. I am Feely Bot. Please click this link to allow me to monitor your emotional health: ${fbConfig.redirect_url}?senderID=${senderID}`)
        }

        break;

      case 'force update':

        sendTextMessage(senderID, `Minh, are you ok?`);

      break;

      default:

      	sendMessToBot(messageText)
      	.then((data) => {

          // echo back if found no intent
          if (Object.keys(data.entities).length != 0) {
            let intent = data.entities.intent[0].value;
            console.log(`Received mess from Wit.ai. Found intent: ${intent}. No reply.`);
          } else {
            console.log('Received mess from Wit.ai. Found no intent');
            sendTextMessage(senderID, 'I do not understand what you are trying to say. Please type "help" to see what I can do.');
          }

      	})
      	.catch((error) =>{
      		console.log(error);
      	});
    }
  } else if (messageAttachments) {

  	let imageUrl = messageAttachments[0]['payload']['url'];
    recentAttachment = imageUrl;
    clarifai.getConcepts(imageUrl)
      .then((data) => {
        sendTextMessage(senderID, `Beautiful ${data[0]}!`);
      });
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
        console.log("Successfully sent message with id %s to recipient %s", messageId, recipientId);
      } else {
        console.log("Successfully called Send API for recipient %s", recipientId);
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
 }

// Start server
// Webhooks must be available via SSL with a certificate signed by a valid 
// certificate authority.
app.listen(app.get('port'), function() {
	console.log('Node app is running on port', app.get('port'));
  	// printDebugInfo();
});
