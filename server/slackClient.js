'use strict';

const RtmClient = require('@slack/client').RtmClient;
const CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
const RTM_EVENTS = require('@slack/client').RTM_EVENTS;
let rtm = null;
let nlp = null;

function handleOnAuthenticated(rtmStartData) {
    console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}, but not yet connected to a channel`);
}

function handleOnMessage(message) {

    if (message.text.toLowerCase().includes('iris')) {
        nlp.ask(message.text, (err, res) => {
            if (err) {
                console.log(err);
                return;
            }
            try {
                if (!res.intent || !res.intent[0] || !res.intent[0].value) {
                    throw new Error("could not extract intent");
                }
                const intent = require('./intents/' + res.intent[0].value + 'Intent');
                intent.process(res, function (error, response) {
                    if (error) {
                        console.log(error.message);
                        return;
                    }
                    return rtm.sendMessage(response, message.channel);
                });
            } catch (err) {
                console.log(err);
                console.log(res);
                rtm.sendMessage("sorry,  I don't know what you are talking about!", message.channel); 
            }
            if (!res.intent) {
                return rtm.sendMessage("Sorry, I don't know what you are talking about.", message.channel);
            } else if (res.intent[0].value == 'time' && res.location) {
                return rtm.sendMessage(`I don't yet know the time in ${res.location[0].value}`, message.channel);
            } else {
                console.log(res);
                return rtm.sendMessage("Sorry, But what the fuck did you say?.", message.channel);
            }

            rtm.sendMessage('Sorry, I did not understand.', message.channel, function messageSent() {
                // optionally, you can supply a callback to execute once the message has been sent
            });
        });
    }



}

function addAuthenticatedHandler(rtm, handler) {
    rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, handler);
}


module.exports.init = function slackClient(token, logLevel, nlpClient) {
    rtm = new RtmClient(token, { logLevel: logLevel });
    nlp = nlpClient;
    addAuthenticatedHandler(rtm, handleOnAuthenticated);
    rtm.on(RTM_EVENTS.MESSAGE, handleOnMessage);
    return rtm;
}

module.exports.addAuthenticatedHandler = addAuthenticatedHandler;