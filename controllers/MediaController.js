var cloudinary = require('cloudinary');
const viewDirectory = 'D:/Projects/practice/chat/views/';
const mediaDirectory = 'D:/Projects/practice/chat/public/assets/uploads';
const fs = require('fs');
cloudinary.config({
    cloud_name: 'snapflipp',
    api_key: '479153981115743',
    api_secret: 'tUjhGleD7tkt75sVPJ45NDTf53I'
});
var CircularJSON = require('circular-json');
var formidable = require('formidable');
const moment = require('moment');



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
                console.log(err);
                return res.status(500).send(err);
            } else {
                cloudinary.uploader.upload(path, function (result) {
                    console.log(result);
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

    return Router;
}