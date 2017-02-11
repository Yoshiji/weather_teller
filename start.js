'use strict';
/* eslint-env es6*/

// loads the .env file and sets Constants
require('dotenv').config();

const watson = require('watson-developer-cloud');

const watson_conversation = new watson.ConversationV1({
  username: process.env.WATSON_CONVERSATION_USERNAME,
  password: process.env.WATSON_CONVERSATION_PASSWORD,
  path: { workspace_id: process.env.WATSON_CONVERSATION_WORKSPACE_ID },
  version_date: watson.ConversationV1.VERSION_DATE_2016_09_20
});

var RtmClient = require('@slack/client').RtmClient;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var bot_token = process.env.SLACK_BOT_TOKEN;
var rtm = new RtmClient(bot_token);
var WatsonRequestHandler = require('./lib/watson_request_handler');

rtm.start();

rtm.on(RTM_EVENTS.MESSAGE, function(message) {
  if (message.type === 'message' && Boolean(message.text)) {
    new WatsonRequestHandler(watson_conversation, rtm, message).execute();
  }
});