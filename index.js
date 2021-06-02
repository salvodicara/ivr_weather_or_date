'use strict'

const voiceEvent = async (req, res, next) => {
    const { logger } = req.nexmo;
    try { 
        logger.info("event", { event: req.body});
        res.json({});
    } catch (err) {
        logger.error("Error on voiceEvent function")
    }
}

const voiceAnswer = async (req, res, next) => {
    const { logger } = req.nexmo;
    logger.info("req", { req_body: req.body});
    try {
        return res.json([
            {
                "action": "talk",
                "text": "Hello we are testing dtmf input actions on NCCO, you still have time to type in your digits"
            },
            {
                "action": "input",
                "eventUrl": [
                  "https://3f9c46f2e3a37c6e25e7ab8192b47158.m.pipedream.net"
                ],
                "type": [ "dtmf", "speech" ],
                "dtmf": {
                  "maxDigits": 10,
                  "timeOut": 10
                },
                "speech": {
                  "context": [ "whatsapp", "viber" ]
                }
            }
        ]);
    } catch (err) {
        logger.error("Error on voiceAnswer function");
    }
}

const route = (app, express) => {
    const expressWs = require('express-ws')(app);
    const WebSocket = require('ws');
    
    expressWs.getWss().on('connection', function (ws) {
        console.log('Websocket connection is open');
    });

    // websocket middleware
    app.ws('/socket', (ws, req) => {
        ws.on('message', (msg) => {
            setTimeout(() => {
                if (ws.readyState === WebSocket.OPEN) ws.send(msg);
            }, 500); 
        });
    });
};

module.exports = {
    voiceEvent,
    voiceAnswer,
    route
}