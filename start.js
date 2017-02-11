'use strict';
/* eslint-env es6*/

// loads the .env file and sets Constants
require('dotenv').config();
var _ = require('underscore');

const watson = require('watson-developer-cloud');

const watson_conversation = new watson.ConversationV1({
  username: process.env.WATSON_CONVERSATION_USERNAME,
  password: process.env.WATSON_CONVERSATION_PASSWORD,
  path: { workspace_id: process.env.WATSON_CONVERSATION_WORKSPACE_ID },
  version_date: watson.ConversationV1.VERSION_DATE_2016_09_20
});

const RtmClient = require('@slack/client').RtmClient;
const RTM_EVENTS = require('@slack/client').RTM_EVENTS;
const rtm = new RtmClient(process.env.SLACK_BOT_TOKEN);
const WatsonRequestHandler = require('./lib/watson_request_handler');

var context_grouped_by_channel_id = {}; // the end-user will have 1 conversation with Watson
var intent_grouped_by_channel_id = {};

rtm.start();

rtm.on(RTM_EVENTS.MESSAGE, function(message) {
  if (message.type === 'message' && Boolean(message.text)) {
    // retrieving previous context and intent, if exists
    var prev_context = context_grouped_by_channel_id[message.channel];
    var prev_intent = intent_grouped_by_channel_id[message.channel];

    new WatsonRequestHandler(watson_conversation, rtm, message, prev_context, prev_intent).execute(function(watson_response) {
      // updating previous context and intent
      var tmp_hash = {};
      tmp_hash[message.channel] = watson_response.context;
      context_grouped_by_channel_id = _.extend(context_grouped_by_channel_id, tmp_hash);
      tmp_hash[message.channel] = watson_response.intents;
      intent_grouped_by_channel_id = _.extend(intent_grouped_by_channel_id, tmp_hash);
    });
  }
});