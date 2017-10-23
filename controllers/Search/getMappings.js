

const Promise = require('promise');
module.exports = function (app, express) {
    const Router = express.Router();
    /**
     * api to get all the mappings
     * In Elasticsearch you can't simply redefine a mapping for an existing field, 
     * but you can see what mappings Elasticsearch has defined with getMapping.
     * Learn More about mapping : https://www.compose.com/articles/elasticsearch-and-node-part-ii/
     */
    Router.get('/mapping', (req, res) => {
        req.check('index', 'mandatory field index missing').notEmpty();
        req.check('type', 'mandatory field type missing').notEmpty();
        let errors = req.validationErrors();
        if (errors) return res.status(422).send({ code: 422, message: errors[0].msg });
        let index = req.query.index.trim();
        let type = req.query.type.trim();
        function getMapping() {
            return new Promise((resolve, reject) => {
                client.indices.getMapping({
                    index: index,
                    type: type
                }, (e, d) => {
                    if (e) {
                        let responseObj = { code: 500, message: 'internal server error', error: e };
                        reject(responseObj);
                    } else {
                        let responseObj = { code: 200, message: 'success', data: d };
                        resolve(responseObj);
                    }
                });
            });
        }
        getMapping().then((data) => {
            return res.status(data.code).send(data);
        }).catch((exception) => {
            return res.status(exception.code).send(excpetion);
        });
    });

    return Router;
}