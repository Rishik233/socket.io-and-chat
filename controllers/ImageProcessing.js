var Jimp = require("jimp");
var CONFIG = require('../config.js');
const viewDirectory = CONFIG.VIEW_DIR;
const mediaDirectory = CONFIG.MEDIA_PATH;
const fs = require('fs');
const moment = require('moment');


module.exports = function (app, express) {
    const Router = express.Router();


    Router.get('/imageProcessing', (req, res) => {
        return res.sendFile(viewDirectory + 'imageProcessing.html');
    });

    /**
     * api to upload an image on cloudinary
     */
    Router.post('/imageProcessing', (req, res) => {
        if (!req.files) return res.status(422).send({ code: 422, message: 'No file selected' });
        let sampleFile = req.files.sampleFile;
        let name = moment().valueOf() + '_' + sampleFile.name;
        let path = mediaDirectory + '/' + name;
        let thumbnailName = mediaDirectory + '/' + 'thumb_' + name;
        let mobileName = mediaDirectory + '/' + 'mobile_' + name;
        sampleFile.mv(mediaDirectory + '/' + name, function (err) {
            if (err) {
                return res.status(500).send(err);
            } else {
                thumbnail(path, thumbnailName);
                mobile(path, mobileName);
                return res.sendFile(viewDirectory + 'imageProcessing.html');
            }
        });
    });

    function thumbnail(path, thumbnailName) {
        Jimp.read(path, function (err, lenna) {
            if (err) throw err;
            lenna.resize(Jimp.AUTO, 256)            // resize 
                .quality(60)                 // set JPEG quality 
                // .greyscale()                 // set greyscale 
                .write(thumbnailName); // save 
        });
    }

    function mobile(path, mobileName) {
        Jimp.read(path, function (err, lenna) {
            if (err) throw err;
            lenna.resize(Jimp.AUTO, 960)            // resize 
                .quality(60)                 // set JPEG quality 
                // .greyscale()                 // set greyscale 
                .write(mobileName); // save 
        });
    }

    Router.get('/uploadedImages', (req, res) => {
        return res.sendFile(viewDirectory + 'uploadedImages.html');
    });

    Router.post('/uploadedImages', (req, res) => {
        var arr = [];
        fs.readdirSync(mediaDirectory).forEach(file => {
            arr.push(file);
        });
        return res.status(200).send({ code: 200, message: 'success', data: arr });
    });

    return Router;
}