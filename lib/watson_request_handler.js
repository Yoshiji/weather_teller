var _ = require('underscore');
var WeatherRequester = require('./weather_requester');

function WatsonRequestHandler(watson_connection, client_connection, client_message, context, intent) {
  this._watson_connection = watson_connection; // to communicate with Watson
  this._client_connection = client_connection; // to forward Watson's response to the client (ex: Slack)
  this._client_message = client_message; // to grab user's input and user's identity
  this._previous_context = context; // to continue a previously created discussion between a User and Watson
  this._previous_intent = intent; // to remember the previous intents and keep them through the discussion
}

WatsonRequestHandler.prototype.execute = function(callback) {
  this.send_text_to_watson(this._client_message.text, callback);
}

WatsonRequestHandler.prototype.send_text_to_watson = function(text_to_send, callback) {
  var self = this;
  var message_attrs = { input: { text: text_to_send } };
  if (this._previous_context) { // this user is already in a conversation with Watson.
    message_attrs.context = this._previous_context;
  }
  if (this._intents) { // this user previously intended something.
    message_attrs.intents = this._previous_intent;
  }
  this._watson_connection.message(message_attrs, function(err, response) {
    if (err) { console.log(err); return; }
    self.handle_watson_response(response, callback);
  });
}

WatsonRequestHandler.prototype.handle_watson_response = function(watson_response, callback) {
  if (watson_response.output.text.length != 0) {
    // forwarding Watson's reply to the client
    this.reply_to_client(watson_response.output.text[0]);
    // calling extra logic that has to be done when Watson responds
    callback(watson_response);

    var weather_was_asked = _.find(watson_response.intents, function(element) { return element.intent == 'weather_asked' });
    // This is the only way I found to know if, previously in the conversation, #weather_asked intent was detected.
    // I could not find a way to directly use Watson's response to know if the new response had a previous intent.
    // major flaw:
    // - User: "Weather for paris"
    // - watson & app respond correctly
    // - User: "what about Montreal?"
    // - watson was rolled back to root node, says "did not understand" but the app. remembers you #weather_asked so it will retrieve the data for Montreal.
    weather_was_asked = weather_was_asked || _.find(this._previous_intent, function(element) { return element.intent == 'weather_asked' });
    var location_was_found_by_watson = _.find(watson_response.entities, function(element) { return element.entity == 'location' });

    if (weather_was_asked && location_was_found_by_watson) {
      var self = this;
      var locations_hashes = _.filter(watson_response.entities, function(el) { return el.entity == 'location' });
      var locations = _.pluck(locations_hashes, 'value');
      // You can actually ask the weather for several places at the same time (but I couldn't configure Watson to name each of the @location entities found)
      _.each(locations, function(location_name) {
        // Made a class to separate code responsibilities
        new WeatherRequester(location_name).execute(function(err, weather_condition) {
          if(err) { console.log(err); return; }
          self.reply_to_client(weather_condition);
        });
      })
    }
  } else {
    this.reply_to_client('Watson had nothing to reply...');
  }
}

WatsonRequestHandler.prototype.reply_to_client = function(text_to_send) {
  this._client_connection.sendMessage(text_to_send, this._client_message.channel);
}

module.exports = WatsonRequestHandler;