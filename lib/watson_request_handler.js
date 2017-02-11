function WatsonRequestHandler(watson_connection, client_connection, client_message) {
  this.watson_connection = watson_connection;
  this.client_connection = client_connection;
  this.client_message = client_message;
}

WatsonRequestHandler.prototype.execute = function() {
  this.send_text_to_watson(this.client_message.text);
}

WatsonRequestHandler.prototype.send_text_to_watson = function(text_to_send) {
  var self = this;
  this.watson_connection.message({ input: { text: text_to_send } }, function(err, response) {
    if (err) { console.log(err); return; }

    self.handle_watson_response(response);
  });
}

WatsonRequestHandler.prototype.handle_watson_response = function(watson_response) {
  if (watson_response.output.text.length != 0) {
    var watson_output_text = watson_response.output.text[0]
    console.log("Watson replied:", watson_output_text);
    this.reply_to_client(watson_output_text);
  }
}

WatsonRequestHandler.prototype.reply_to_client = function(text_to_send) {
  this.client_connection.sendMessage(text_to_send, this.client_message.channel)
}

module.exports = WatsonRequestHandler;