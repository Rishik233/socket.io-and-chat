var cloudinary = require('cloudinary');
const CONFIG = require('../config.js');
const viewDirectory = CONFIG.MEDIA_PATH;
const mediaDirectory = CONFIG.VIEW_DIR;
const fs = require('fs');
cloudinary.config({
    cloud_name: 'dkcefcqnr',
    api_key: '789331917861355',
    api_secret: 'RxC5j552w65QDCQ8X1aF7Kn5GSY'
});
var CircularJSON = require('circular-json');
var formidable = require('formidable');
const moment = require('moment');
let videoStitch = require('video-stitch');
let videoConcat = videoStitch.concat;
let videoMerge = videoStitch.merge;
const promise = require('promise');

module.exports = function (app, express) {
    var Router = express.Router();

    /**
     * api return file upload form
     */
    Router.get('/uploadImage', (req, res) => {
        return res.sendFile(viewDirectory + 'file-upload.html');
    });
    /**
     * api to upload an image on cloudinary
     */
    Router.post('/uploadImage', (req, res) => {
        if (!req.files) return res.status(422).send({ code: 422, message: 'No file selected' });
        let sampleFile = req.files.sampleFile;
        // console.log(sampleFile);
        let name = moment().valueOf() + '_' + sampleFile.name;
        let path = mediaDirectory + '/' + name;
        sampleFile.mv(mediaDirectory + '/' + name, function (err) {
            if (err) {
                return res.status(500).send(err);
            } else {
                cloudinary.uploader.upload(path, function (result) {
                    // console.log(result);
                    let mediaCollection = mongoDb.collection('media');
                    let dataToInsert = {
                        createdOn: moment().valueOf(),
                        localName: name,
                        publicId: result.public_id,
                        url: result.url,
                        secureUrl: result.secure_url,
                        resourceType: result.resource_type,
                        height: result.height,
                        width: result.width
                    };
                    mediaCollection.insert(dataToInsert, (e, d) => {
                        if (e) {
                            return res.status(500).send({ code: 500, message: 'could not insert uploaded media' });
                        } else {
                            return res.sendFile(viewDirectory + 'file-upload.html');
                        }
                    });
                });
            }
        });
    });

    /**
     * api to delete an image from cloudinary
     * 
     */
    Router.delete('/uploadImage', (req, res) => {
        cloudinary.v2.uploader.destroy('wydofspsh2f0w1weaywa',
            function (error, result) {
                if (error) return res.status(500).send({ code: 500, messag: 'error', error: error });
                else return res.status(200).send({ code: 200, messag: 'deleted', data: result });
            });
    });


    /**
     * api to upload an video 
     */

    Router.get('/video', (req, res) => {
        return res.sendFile(viewDirectory + 'uploadVideo.html');
    });


    /**
     * upload video files
     * @param {*} username
     * @param {*} videoFile
     * @param {*} title
     * @param {*} description
     * @param {*} emptyWeight
     * @param {*} loadedWeight
     * @param {*} takeOffWeight
     * @param {*} speed
     */

    Router.post('/video', (req, res) => {
        req.check('username', 'mandatory paramter username missing').notEmpty();
        req.check('title', 'mandatory paramter title missing').notEmpty();
        req.check('description', 'mandatory paramter description missing').notEmpty();
        req.check('emptyWeight', 'mandatory paramter emptyWeight missing').notEmpty();
        req.check('loadedWeight', 'mandatory paramter loadedWeight missing').notEmpty();
        req.check('takeOffWeight', 'mandatory paramter takeOffWeight missing').notEmpty();
        req.check('speed', 'mandatory paramter speed missing').notEmpty();
        let errors = req.validationErrors();
        if (errors) return res.status(422).send({ code: 422, message: errors[0].msg });
        if (!req.files) return res.status(422).send({ code: 422, message: 'No file selected' });
        let videoFile = req.files.videoFile;
        let name = moment().valueOf() + '_' + videoFile.name;
        let path = mediaDirectory + '/' + name;
        let mediaCollection = mongoDb.collection('media');
        var dataToInsert = {};
        function uploadVideo() {
            return new Promise((resolve, reject) => {
                videoFile.mv(mediaDirectory + '/' + name, function (err) {
                    if (err) {
                        let responseObj = { code: 500, message: 'error', error: err };
                        reject(responseObj);
                    } else {
                        cloudinary.uploader.upload(path,
                            function (result) {
                                dataToInsert = {
                                    username: req.body.username.trim().toLowerCase(),
                                    title: req.body.title.trim().toLowerCase(),
                                    description: req.body.description.trim().toLowerCase(),
                                    emptyWeight: parseFloat(req.body.emptyWeight),
                                    loadedWeight: parseFloat(req.body.loadedWeight),
                                    takeOffWeight: parseFloat(req.body.takeOffWeight),
                                    speed: parseFloat(req.body.speed),
                                    createdOn: moment().valueOf(),
                                    localName: name,
                                    publicId: result.public_id,
                                    url: result.url,
                                    secureUrl: result.secure_url,
                                    resourceType: result.resource_type,
                                    size: result.bytes,
                                    format: result.format,
                                    height: result.height,
                                    width: result.width,
                                    audio: result.audio,
                                    video: result.video
                                };
                                mediaCollection.insert(dataToInsert, (e, d) => {
                                    if (e) {
                                        let responseObj = { code: 500, message: 'could not insert uploaded media' };
                                        reject(responseObj);
                                    } else {
                                        resolve(d);
                                    }
                                });
                            },
                            { resource_type: "video" });
                    }
                });
            });
        }

        function createdIndex() {
            return new promise((resolve, reject) => {
                client.indices.create({
                    index: 'planes'
                }, function (err, resp, status) {
                    if (err) {
                        let responseObj = {
                            code: 500,
                            message: 'internal server error while creating index',
                            error: err
                        };
                        reject(err);
                    }
                    else {
                        resolve(resp);
                    }
                });
            });
        }

        function createDocument() {
            return new Promise((resolve, reject) => {
                client.index({
                    index: 'planes',
                    id: publicId,
                    type: 'fighterPlanes',
                    body: dataToInsert
                }, function (err, resp, status) {
                    if (err) {
                        let responseObj = {
                            code: 500,
                            message: 'internal server error while inserting document in elastic search',
                            error: err
                        };
                        reject(err);
                    } else {
                        resolve(resp);
                    }
                });
            });
        }

        uploadVideo().then((data) => {
            return createdIndex();
        }).then((data) => {
            return createDocument();
        }).then((data) => {
            return res.sendFile(viewDirectory + 'uploadVideo.html');
        }).catch((error) => {
            return res.status(error.code).send(error);
        });
    });


    /**
     * api to concatenate two videos
     */

    Router.get('/joinVideos', (req, res) => {
        //url 
        //https://res.cloudinary.com/dkcefcqnr/video/upload/w_640,h_360,c_fill/l_video:adkxs8ysm1uj7hqeeaz4,fl_splice,w_640,h_360,c_fill/akqp5rcrnpthznrst36b.mp4
        // cloudinary.video("akqp5rcrnpthznrst36b", {
        //     transformation: [
        //         { width: 300, height: 200, crop: "fill" },
        //         { overlay: "video:adkxs8ysm1uj7hqeeaz4", flags: "splice", width: 300, height: 200, crop: "fill" }
        //     ]
        // });

        // https://res.cloudinary.com/demo/video/upload/w_300,h_200,c_fill/l_video:dog,fl_splice,w_300,h_200,c_fill/l_video:kitten_fighting,f1_splice,w_300,h_200,c_fill/dog.mp4
        // https://res.cloudinary.com/dkcefcqnr/video/upload/w_640,h_360,c_fill/l_video:adkxs8ysm1uj7hqeeaz4,fl_splice,w_640,h_360,c_fill/l_video:akqp5rcrnpthznrst36b,f1_splice,w_640,h_360,c_fill/vudzlrldlbzn2lyzfz0f.mp4
    });



    return Router;
}