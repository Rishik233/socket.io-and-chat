const viewDirectory = 'D:/Projects/practice/chat/views/';
const promise = require('promise');
module.exports = (app, express) => {
    const Router = express.Router();
    /**
     * api to return search page
     */
    Router.get('/search', (req, res) => {
        return res.sendFile(viewDirectory + 'search.html');
    });

    /**
     * search an aircraft by name
     * @param {*} searchTerm
     */

    Router.post('/search', (req, res) => {
        if (!req.body.searchTerm) return res.status(422).send({ code: 422, message: 'mandatory searchTerm missing' });
        function search() {
            return new Promise((resolve, reject) => {
                client.search({
                    index: 'planes',
                    type: 'militaryAircrafts',
                    body: {
                        query: {
                            match: { "name": req.body.searchTerm.trim() }
                        },
                    }
                }, function (error, response, status) {
                    if (error) {
                        let responseObj = {
                            code: 500,
                            message: 'internal server error',
                            error: error
                        };
                        reject(responseObj)
                    }
                    else {
                        let responseObj = {
                            code: 200,
                            message: 'success',
                            data: response
                        };
                        resolve(responseObj);

                    }
                });
            });
        }

        search().then((data) => {
            return res.status(200).send(data);
        }).catch((error) => {
            return res.status(error.code).send(error);
        });
    });

    /**
     * wildcards and regular expression search
     * For an example of a wildcard search, search for aircraft names starting with any three characters followed by '29':
     */


    Router.post('/searchWildCard', (req, res) => {
        if (!req.body.searchTerm) return res.status(422).send({ code: 422, message: 'mandatory searchTerm missing' });
        function search() {
            return new Promise((resolve, reject) => {
                client.search({
                    index: 'planes',
                    type: 'militaryAircrafts',
                    body: {
                        query: {
                            regexp: { "name": req.body.searchTerm.trim() + ".+15" }
                        },
                    }
                }, function (error, response, status) {
                    if (error) {
                        let responseObj = {
                            code: 500,
                            message: 'internal server error',
                            error: error
                        };
                        reject(responseObj)
                    }
                    else {
                        let responseObj = {
                            code: 200,
                            message: 'success',
                            data: response
                        };
                        resolve(responseObj);

                    }
                });
            });
        }

        search().then((data) => {
            return res.status(200).send(data);
        }).catch((error) => {
            return res.status(error.code).send(error);
        });
    });

    /**
     * api to return count of documents in an index
     * @param {*} name // name of index
     */

    Router.get('/documentsCount/:indexName/:docType', (req, res) => {
        req.checkParams('indexName', 'madatory indexName is missing').notEmpty();
        req.checkParams('docType', 'madatory docType is missing').notEmpty();
        var errors = req.validationErrors();
        if (errors) return res.status(422).send({ code: 422, message: errors[0].msg });
        let name = req.params.indexName.trim();
        let doc = req.params.docType.trim();
        function getDocumentsCount() {
            return new Promise((resolve, reject) => {
                client.count({ index: name, type: doc }, function (err, resp, status) {
                    if (err) {
                        let responseObj = {
                            code: 500,
                            message: 'error',
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

        getDocumentsCount().then((data) => {
            return res.status(200).send(data);
        }).catch((error) => {
            return res.status(error.code).send(error);
        });
    });
    return Router;
}