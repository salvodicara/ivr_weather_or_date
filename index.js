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
                  "https://examplecallbackurl.net"
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

    app.get('/api/token/:username', async (req, res) => {
        const {
            logger,
            csClient,
            storageClient,
            generateUserToken,
            config
        } = req.nexmo;

        // logger.error({ user }, "STORAGE")
        const { username } = req.params;

        res.json({
            username,
            token: generateUserToken(username)
        })

    })

    app.get('/api/info', async (req, res) => {
        const {
            logger,
            csClient,
            storageClient,
            config
        } = req.nexmo;

        // logger.error({ user }, "STORAGE")
        res.json({
            config
        })

    })

    app.get('/api/users', async (req, res) => {
        const {
            logger,
            csClient,
            storageClient,
            config
        } = req.nexmo;

        const resGetUsers = await csClient({
            url: `${DATACENTER}/v0.3/users`,
            method: "get"
        })

        // logger.error({ user }, "STORAGE")
        res.json({
            users: resGetUsers.data
        })

    })
};

module.exports = {
    voiceEvent,
    voiceAnswer,
    route
}