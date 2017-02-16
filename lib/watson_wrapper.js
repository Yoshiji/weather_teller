var WatsonRequestHandler = require('./watson_request_handler');

function WatsonWrapper(channel_id, watson_interface, rtm) {
  this._channel_id = channel_id;
  this._watson_interface = watson_interface;
  this._rtm = rtm;
  this._previous_intents = [];
  this._context = {};
}

WatsonWrapper.prototype.process_message = function(message_str) {
  var message_attrs = this.compute_watson_message_attrs(message_str);
  new WatsonRequestHandler(this, message_attrs);
}

WatsonWrapper.prototype.reply_to_client = function(message_str) {
  this._rtm.sendMessage(message_str, this._channel_id);
}

WatsonWrapper.prototype.compute_watson_message_attrs = function(message_str) {
  var message_attrs = { input: { text: message_str } };
  message_attrs.intents = this._previous_intents;
  message_attrs.context = this._context;
  return message_attrs;
}

WatsonWrapper.prototype.update_watson_conv_state = function(watson_response_json) {
  // the watson's response does not contain the previous intents, I have to store it and test it to make a call to the weather API
  // (I could not find in watson's response a clean reference to the previous intents)
  this._previous_intents = watson_response_json.intents;
  this._context = watson_response_json.context;
}

module.exports = WatsonWrapper;