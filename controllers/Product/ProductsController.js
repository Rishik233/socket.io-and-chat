const moment = require('moment');
const promise = require('promise');

module.exports = function (app, express) {
    const Router = express.Router();

    /**
     * api to create an index on elastic DB
     * @param {*} name
     */
    Router.post('/createIndex', (req, res) => {
        req.check('name', 'mandatory index name missing').notEmpty();
        var errors = req.validationErrors();
        if (errors) return res.status(422).send({ code: 422, message: errors[0].msg });
        let name = req.body.name.toLowerCase().trim();
        function createIndex() {
            return new Promise((resolve, reject) => {
                client.indices.create({
                    index: name
                }, function (err, resp, status) {
                    if (err) {
                        let responseObj = { code: 500, message: 'could not create index', error: err };
                        reject(responseObj);
                    }
                    else {
                        let responseObj = { code: 200, message: 'success', result: resp };
                        resolve(responseObj);
                    }
                });
            });
        }

        createIndex().then((data) => {
            return res.status(200).send(data);
        }).catch((error) => {
            return res.status(error.code).send(error);
        });
    });


    /**
     * api to post an aircraft 
     * @param {*} name
     * @param {*} description
     * @param {*} emptyWeight
     * @param {*} loadedWeight
     * @param {*} engine
     * @param {*} speed
     * @param {*} rateOfClimb
     * @param {*} armament
     * @param {*} image
     * @param {*} type
     * document type militaryAircrafts
     */
    Router.post('/planes', (req, res) => {
        req.check('name', 'mandatory name missing').notEmpty();
        req.check('description', 'mandatory description missing').notEmpty();
        req.check('emptyWeight', 'mandatory emptyWeight missing').notEmpty();
        req.check('loadedWeight', 'mandatory loadedWeight missing').notEmpty();
        req.check('engine', 'mandatory engine missing').notEmpty();
        req.check('speed', 'mandatory speed missing').notEmpty();
        req.check('rateOfClimb', 'mandatory rateOfClimb missing').notEmpty();
        req.check('armament', 'mandatory armament missing').notEmpty();
        req.check('image', 'mandatory image missing').notEmpty();
        req.check('type', 'mandatory type missing').notEmpty();
        var errors = req.validationErrors();
        if (errors) return res.status(422).send({ code: 422, message: errors[0].msg });
        function addAircraft() {
            return new Promise((resolve, reject) => {
                client.index({
                    index: 'planes',
                    type: 'militaryAircrafts',
                    body: {
                        name: req.body.name.trim(),
                        description: req.body.description.trim(),
                        emptyWeight: parseFloat(req.body.emptyWeight),
                        loadedWeight: parseFloat(req.body.loadedWeight),
                        engine: req.body.engine,
                        speed: parseFloat(req.body.speed),
                        armament: req.body.armament,
                        image: req.body.image,
                        type: parseInt(req.body.type)
                    }
                }, function (err, resp, status) {
                    if (err) {
                        let responseObj = {
                            code: 500,
                            message: 'internal server error',
                            error: err
                        };
                        reject(responseObj);
                    } else {
                        let responseObj = {
                            code: 200,
                            message: 'success',
                            data: resp
                        };
                        resolve(responseObj);
                    }
                });
            });
        }

        addAircraft().then((data) => {
            return res.status(200).send(data);
        }).catch((error) => {
            return res.status(error.code).send(error);
        });
    });

    /**
     * delete a document 
     * @param {*} _id
     */
    Router.post('/deletePlanes/:_id', (req, res) => {
        req.checkParams('_id', 'mandatory parameter _id missing').notEmpty();
        req.checkBody('index', 'mandatory parameter index missing').notEmpty();
        req.checkBody('type', 'mandatory parameter type missing').notEmpty();
        var errors = req.validationErrors();
        if (errors) return res.status(422).send({ code: 422, message: errors[0].msg });
        let _id = req.params._id;
        let index = req.body.index.trim();
        let type = req.body.type.trim();
        function deleteAircraftDocument() {
            return new Promise((resolve, reject) => {
                client.delete({
                    index: index,
                    id: _id,
                    type: type
                }, function (err, resp, status) {
                    if (err) {
                        let responseObj = {
                            code: 500,
                            message: 'internal server error',
                            error: err
                        };
                        reject(responseObj);
                    } else {
                        let responseObj = {
                            code: 200,
                            message: 'success',
                            data: resp
                        };
                        resolve(responseObj);
                    }
                });
            });
        }
        deleteAircraftDocument().then((data) => {
            return res.status(200).send(data);
        }).catch((error) => {
            return res.status(error.code).send(error);
        });
    });

    return Router;
}