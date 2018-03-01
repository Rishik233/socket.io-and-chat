var CONFIG = require('../config.js');
const viewDirectory = CONFIG.VIEW_DIR;
const moment = require('moment-timezone');
module.exports = function (app, express) {
    const Router = express.Router();

    /**
     * api to get all the timeZones from momentTimeZone API
     */
    Router.get('/timeZones', (req, res) => {
        var timezones = moment.tz.names();
        return res.status(200).send({ code: 200, message: 'success', data: timezones });
    });

    /**
     * api to render and return calendar.html page
     */
    Router.get('/calendar', (req, res) => {
        return res.sendFile(viewDirectory + 'calendar.html');
    });

    /**
     * api to convert time from one timezone to another
     * @param {*} bdaytime user's current time in local timezone
     * @param {*} timeZone1 first time zone
     * @param {*} timeZone2 second time zone
     */
    Router.post('/calendar', (req, res) => {
        req.check('bdaytime', 'paramter bdaytime missing').notEmpty();
        req.check('timeZone1', 'paramter timeZone1 missing').notEmpty();
        req.check('timeZone2', 'paramter timeZone2 missing').notEmpty();
        let errors = req.validationErrors();
        if (errors) return res.status(422).send({ code: 422, message: errors[0].msg });
        let timeZone1 = req.body.timeZone1.trim();
        let timeZone2 = req.body.timeZone2.trim();
        let dateTime = parseInt(req.body.bdaytime);
        // console.log(dateTime);
        let x = moment(dateTime).valueOf();
        var a = moment(dateTime).tz(timeZone1).format('MMMM Do YYYY, h:mm:ss a');
        var b = moment(dateTime).tz(timeZone2).format('MMMM Do YYYY, h:mm:ss a');
        var c = moment(dateTime).tz("GMT").format('MMMM Do YYYY, h:mm:ss a');
        return res.send({ timeZone1: timeZone1, timeZone2: timeZone2, dateTime: dateTime, a: a, b: b, c: c });

    });




    return Router;
}