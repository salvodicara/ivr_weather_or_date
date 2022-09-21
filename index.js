/*
Exercise 3
when the customer select the option 2,  give a list of 9 citiies with a number
the customer can select a city via dtmf (and then get the city forecast)
*/

'use strict'
const axios = require('axios').default;


const firstInputEndpoint = "/ncco/date_or_weather"
const secondInputEndpoint = "/ncco/select_city"
const api_key = ""
if(!api_key){
    throw Error("Create your OpenWeatherMap API key at https://home.openweathermap.org/subscriptions/billing_info/onecall_30/base?key=base&service=onecall_30")
}

const cities = ['London', 'Bristol', 'Rome', 'Madrid','Paris', 'Berlin', 'New York', 'Beijing', 'Moscow']

const voiceEvent = async (req, res, next) => {
    const { logger } = req.nexmo;
    try {
        logger.info("event", { event: req.body});
        res.json({});
    } catch (err) {
        logger.error("Error on voiceEvent function")
    }
}

//App entry point
const voiceAnswer = async (req, res, next) => {
    const { logger } = req.nexmo;
    logger.info("req", { req_body: req.body});
    try {
        return res.json([
            {
                "action": "talk",
                "text": `Hello we are testing dtmf input actions on NCCO, press 1 to hear today's date or press 2 to hear today's weather forecast in several cities.`,
                //set this attribute to true to trigger the input before the speak action is finished
                "bargeIn": true 
            },
            {
                "action": "input",
                "eventUrl": [`${config.server_url}${firstInputEndpoint}`],
                "type": ["dtmf"],
                "dtmf": {
                  "maxDigits": 1,
                  "timeOut": 10
                }
            }
        ]);
    } catch (err) {
        logger.error("Error on voiceAnswer function");
    }
}

function getTodayDate() {
    let date_ob = new Date();
    let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "November", "December"]
    // current date
    let date = date_ob.getDate()
    // current month
    let month = months[date_ob.getMonth()]
    // current year
    let year = date_ob.getFullYear();

    return `${date} ${month} ${year}`
}

async function getWeatherForecast(city){
    try {
        const res = await axios.get(`http://api.openweathermap.org/data/2.5/weather?units=metric&q=${city}&APPID=${api_key}`)
        const weather = res.data.weather[0].description
        const temperature = res.data.main.temp
        const text = `The weather in ${city} is ${weather} and there are ${temperature} degrees.`
        return text
    } catch (error) {
        return `Error in reading weather forecast for ${city}`
    }
}

function getCityList() {
    let string = ''
    cities.forEach((element, index) => {
        string += `Press ${index+1} for ${element}. `
    })
    return string
}

//function triggered on DTMF
const onFirstInput = async (req, res) => {
    const { logger, config } = req.nexmo;

    try {
        logger.info("request_body", req.body);
        const dtmf = req.body.dtmf
        const digits = dtmf.digits
        const timedOut = dtmf.timed_out
        let text = `I'm sorry You have inserted an invalid number`
        let ncco = [
            {
                action: 'talk',
                text: text
            },
            {
                action: 'talk',
                text: `I'm hanging up, bye`
            }
        ]
        if(timedOut){
            ncco[0].text = `I'm sorry, your request timed out`
        }
        else if(digits === "1"){
            ncco[0].text = `Today is ${getTodayDate()}`
        }
        else if (digits === "2"){
            //build a new NCCO
            ncco = [
                {
                    "action": "talk",
                    "text": `You pressed 2. Select one of the following cities to hear its weather forecast.`,
                    //set this attribute to true to trigger the input before the speak action is finished
                    "bargeIn": true 
                },
                {
                    "action": "talk",
                    "text": getCityList(),
                    //set this attribute to true to trigger the input before the speak action is finished
                    "bargeIn": true 
                },
                {
                    "action": "input",
                    //direct the result to another route
                    "eventUrl": [`${config.server_url}${secondInputEndpoint}`],
                    "type": ["dtmf"],
                    "dtmf": {
                      "maxDigits": 1,
                      "timeOut": 10
                    }
                }
            ]
        }
        res.json(ncco)
    } catch (err) {
        logger.error({err}, "Error on onFirstInput function")
    }
}

const onSecondInput = async (req, res) => {
    const { logger, config } = req.nexmo;

    try {
        logger.info("request_body", req.body);
        const dtmf = req.body.dtmf
        const digits = dtmf.digits
        const digit = parseInt(digits)
        const timedOut = dtmf.timed_out
        let text = `I'm sorry You have inserted an invalid number`
        if(timedOut){
            text = `I'm sorry, your request timed out`
        }
        else if(digit > 0 && digit < 10 && Number.isInteger(digit)){
            const city = cities[digit - 1]
            text = await getWeatherForecast(city)
        }
        const ncco = [
            {
                action: 'talk',
                text: text
            },
            {
                action: 'talk',
                text: `I'm hanging up, bye`
            }
        ]
        res.json(ncco)
    } catch (err) {
        logger.error({err}, "Error on onSecondInput function")
    }
}

const route = (app, express) => {
    //route for eventUrl
    app.post(firstInputEndpoint, onFirstInput)
    app.post(secondInputEndpoint, onSecondInput)
};

module.exports = {
    voiceEvent,
    voiceAnswer,
    route
}