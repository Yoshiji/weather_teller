var http = require('http');

function WeatherRequester(location_name) {
  this._location_name = location_name;
}

WeatherRequester.prototype.compute_url = function() {
  var url = "http://api.apixu.com/v1/current.json?key=";
  url += process.env.APIXU_KEY;
  url += "&q=" + this._location_name;
  return url;
}

WeatherRequester.prototype.json_response_to_text = function(json) {
  var label = "In " + json.location.name + ", ";
  var temperature = "the current temperature in Celsius is " + json.current.temp_c;
  var condition = "the current condition is " + json.current.condition.text + '.';
  return label + temperature + ' and ' + condition;
}

WeatherRequester.prototype.execute = function(callback) {
  var self = this;
  http.get(this.compute_url(), function(res) {
    var body = '';

    res.on('data', function(chunk){
      body += chunk;
    });
    res.on('end', function() {
      try {
        const json_response = JSON.parse(body);
      } catch (e) {
        callback(new TypeError('Error parsing JSON!'), null);
      }
      callback(null, self.json_response_to_text(json_response));
    })
  }).on('error', function(e) {
    console.log("Got error: " + e.message);
  });
}

module.exports = WeatherRequester;