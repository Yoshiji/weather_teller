var WeatherRequester = require('./weather_requester');

function WatsonRequestHandler(watson_wrapper, message_attrs) {
  watson_wrapper._watson_interface.message(message_attrs, function(err, watson_response_json) {
    if (err) { console.log(err); return; }

    if (watson_response_json.output.text.length != 0) {
      // forwarding Watson's response text to the client
      watson_wrapper.reply_to_client(watson_response_json.output.text[0]);

      // detecting if the user asked for the weather in this message
      var weather_was_asked = watson_response_json.intents.find(function(el) { return el.intent == 'weather_asked' });
      // detecting if the user asked for the weather in his previous message
      weather_was_asked = weather_was_asked || watson_wrapper._previous_intents.find(function(el) { return el.intent == 'weather_asked' });
      // detecting if the user provided a location
      var location_was_found = watson_response_json.entities.find(function(el) { return el.entity == 'location' });

      if (weather_was_asked && location_was_found) {
        // "plucking" all locations provided by the user
        var locations_hashes = watson_response_json.entities.filter(function(el) { return el.entity == 'location' });
        var locations = locations_hashes.map(function(el) { return el.value; });

        locations.forEach(function(location_name) {
          new WeatherRequester(location_name).execute(function(err, weather_condition_str) {
            if(err) { console.log(err); return; }

            watson_wrapper.reply_to_client(weather_condition_str);
          });
        })
      }
      // updating watson_wrapper with current context and intents
      watson_wrapper.update_watson_conv_state(watson_response_json);
    }
  });
}

module.exports = WatsonRequestHandler;