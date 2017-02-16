'use strict';
/* eslint-env es6*/

require('dotenv').config();

const watson = require('watson-developer-cloud');

const watson_interface = new watson.ConversationV1({
  username: process.env.WATSON_CONVERSATION_USERNAME,
  password: process.env.WATSON_CONVERSATION_PASSWORD,
  path: { workspace_id: process.env.WATSON_CONVERSATION_WORKSPACE_ID },
  version_date: watson.ConversationV1.VERSION_DATE_2016_09_20
});

const RtmClient = require('@slack/client').RtmClient;
const RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var rtm = new RtmClient(process.env.SLACK_BOT_TOKEN);
const WatsonWrapper = require('./lib/watson_wrapper');

rtm.start();

var watsons_by_channel_id = {};

rtm.on(RTM_EVENTS.MESSAGE, function(message) {
  if (message.type === 'message' && Boolean(message.text)) {

    if (!watsons_by_channel_id[message.channel]) {
      watsons_by_channel_id[message.channel] = new WatsonWrapper(message.channel, watson_interface, rtm);
    }

    var watson_wrapper = watsons_by_channel_id[message.channel];
    watson_wrapper.process_message(message.text);
  }
});