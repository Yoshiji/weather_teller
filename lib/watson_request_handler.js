var _ = require('underscore');
var WeatherRequester = require('./weather_requester');

function WatsonRequestHandler(watson_connection, client_connection, client_message) {
  this._watson_connection = watson_connection;
  this._client_connection = client_connection;
  this._client_message = client_message;
}

WatsonRequestHandler.prototype.execute = function() {
  this.send_text_to_watson(this._client_message.text);
}

WatsonRequestHandler.prototype.send_text_to_watson = function(text_to_send) {
  var self = this;
  
  this._watson_connection.message({ input: { text: text_to_send } }, function(err, response) {
    if (err) { console.log(err); return; }
    self.handle_watson_response(response);
  });
}

WatsonRequestHandler.prototype.handle_watson_response = function(watson_response) {
  if (watson_response.output.text.length != 0) {
    if (_.find(watson_response.intents, function(element) { return element.intent == 'weather_asked' }) &&
        _.find(watson_response.entities, function(element) { return element.entity == 'weather' }) &&
        _.find(watson_response.entities, function(element) { return element.entity == 'location' })) {
      // Weather is asked, 1+ location(s) entity is given
      var self = this;
      var locations_hashes = _.filter(watson_response.entities, function(el) { return el.entity == 'location' });
      var locations = _.pluck(locations_hashes, 'value');
      _.each(locations, function(location_name) {
        new WeatherRequester(location_name).execute(function(err, weather_condition) {
          if(err) { console.log(err); return; }
          self.reply_to_client(weather_condition);
        });
      })
    }
    this.reply_to_client(watson_response.output.text[0]);
  } else {
    this.reply_to_client('Watson had nothing to reply...');
  }
}

WatsonRequestHandler.prototype.reply_to_client = function(text_to_send) {
  // console.log('text to send to client:', text_to_send)
  this._client_connection.sendMessage(text_to_send, this._client_message.channel);
}

module.exports = WatsonRequestHandler;