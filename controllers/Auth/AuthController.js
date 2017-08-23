
const bcrypt = require('bcrypt');
const saltRounds = 10;
const viewDirectory = 'D:/Projects/practice/chat/views/';
const moment = require('moment');
const promise = require('promise');
const jsonwebtoken = require('jsonwebtoken');
const secretKey = "secretKey";

module.exports = function (app, express) {
    /**
     * function to generate jwt token
     * @param {*} useuserIdr
     */
    function createToken(userId) {
        var token = jsonwebtoken.sign({
            id: userId
        }, secretKey, {
                expiresIn: '60 days'
            });
        return token;
    }

    const Router = express.Router();

    /**
     * API to get registration page for users
     * @return register.html
     */
    Router.get('/register', (req, res) => {
        res.sendFile(viewDirectory + 'register.html');
    });

    /**
     * API to register a user on app
     * @param {*} email
     * @param {*} password
     * @param {*} username
     */

    Router.post('/register', (req, res) => {
        var userCollection = mongoDb.collection('user');
        req.check('email', 'mandatory email missing').notEmpty();
        req.check('password', 'mandatory password missing').notEmpty();
        req.check('username', 'mandatory username missing').notEmpty();
        req.check('email', 'invalid email id').isEmail();
        let errors = req.validationErrors();
        if (errors) return res.status(422).send({ code: 422, message: errors[0].msg });
        let responseObj = {};
        let dataToInsert = {
            username: req.body.username.trim(),
            email: req.body.email.trim(),
            createdOn: moment().valueOf()
        };


        function checkUserName() {

            return new Promise((resolve, reject) => {
                userCollection.findOne({ username: dataToInsert.username }, (e, d) => {
                    if (e) {
                        responseObj = { code: 500, message: 'internal server error', error: e };
                        reject(responseObj);
                    } else if (d) {
                        responseObj = { code: 409, message: 'username taken', data: d };
                        reject(responseObj);
                    } else {
                        responseObj = { code: 200, message: 'success' };
                        resolve(responseObj);
                    }
                });
            });
        }

        function checkEmail() {

            return new Promise((resolve, reject) => {
                userCollection.findOne({ email: dataToInsert.email }, (e, d) => {
                    if (e) {
                        responseObj = { code: 500, message: 'internal server error while verifying email', error: e };
                        reject(responseObj);
                    } else if (d) {
                        responseObj = { code: 409, message: 'email taken', data: d };
                        reject(responseObj);
                    } else {
                        responseObj = { code: 200, message: 'success' };
                        resolve(responseObj);
                    }
                });
            });
        }

        function registerUser() {
            return new Promise((resolve, reject) => {
                bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
                    if (err) {
                        return res.status(500).send({ code: 500, message: 'error hashing password', error: err });
                    } else {
                        dataToInsert.password = hash;
                        userCollection.insert(dataToInsert, (e, d) => {
                            if (e) {
                                responseObj = { code: 500, message: 'internal server error while creating user', error: e };
                                reject(responseObj);
                            } else {
                                responseObj = { code: 200, message: 'success', data: d };
                                resolve(responseObj);
                            }
                        });
                    }
                });
            });
        }

        checkUserName().then((data) => {
            return checkEmail();
        }).then((data) => {
            return registerUser();
        }).then((data) => {
            return res.send(data).status(data.code);
        }).catch((error) => {
            return res.send(error).status(error.code);
        });
    });


    /**
     * api to authenticate a user on app
     */
    Router.post('/login', (req, res) => {
        req.check('password', 'mandatory password missing').notEmpty();
        req.check('username', 'mandatory username missing').notEmpty();
        let errors = req.validationErrors();
        if (errors) return res.status(422).send({ code: 422, message: errors[0].msg });
        const userCollection = mongoDb.collection('user');
        var responseObj = {};
        function authenticateUser() {
            return new Promise((resolve, reject) => {
                userCollection.findOne({ username: req.body.username }, (e, d) => {
                    if (e) {
                        responseObj = {
                            code: 500,
                            message: 'internal server error',
                            error: e
                        };
                        reject(responseObj);
                    } else if (!d) {
                        responseObj = {
                            code: 204,
                            message: 'user not found'
                        };
                        reject(responseObj);
                    } else {
                        bcrypt.compare(req.body.password.trim(), d.password, function (err, res) {
                            if (err) {
                                responseObj = {
                                    code: 500,
                                    message: 'internal server error while comparing password',
                                    error: err
                                };
                                reject(responseObj);
                            } else if (!res) {
                                responseObj = {
                                    code: 401,
                                    message: 'passwords did not match'
                                };
                                reject(responseObj);
                            } else {
                                let token = createToken(d._id);
                                responseObj = {
                                    code: 200,
                                    message: 'success',
                                    username: d.username,
                                    userId: d._id,
                                    email: d.email,
                                    accessToken: token,
                                    createdOn: d.createdOn
                                };
                                resolve(responseObj);
                            }
                        });
                    }
                });
            });
        }

        authenticateUser().then((data) => {
            return res.send(data).status(200);
        }).catch((error) => {
            return res.send(error).status(error.code);
        });
    });
    return Router;
}