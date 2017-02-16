# weather_teller

Tells you the weather for a given location (using Slack bot)

# Instructions

- clone this project's source code to your local machine
- run `npm install` to install dependencies
- copy the `.env.template` file and rename it `.env` (this file will NOT be added to Git)
- in this `.env` file, insert your API keys, Tokens, username and password for:
  - Watson conversation (workspace_id, username, password)
  - Slack bot token (you need to create a Bot on Slack)
  - API XU key (https://www.apixu.com/)
- in Watson conversation, import the file `fixtures/weather_teller_watson_conversation.json` into your workspace
- run `npm start` to launch the app and connect the Slack bot
- in your Slack interface, open a private chat with the Slack bot linked to this app.
- talk with your Slack bot!

# Limitations

- Watson Conversation can:
  - recognise only these cities: London, New York, Paris and Montreal.
  - detect the following intents: Greetings, Thanks and when you ask for the weather.

# Screenshot as example

![Weather Teller on Slack screenshot](http://i.imgur.com/rOD4jrQ.png)