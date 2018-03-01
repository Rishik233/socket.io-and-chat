var assert = require('assert');
var authController = require('../../controllers/Auth/auth.controller');
var expect = require('chai').expect;

//To run test
//mocha "./test/**/*.spec.js"

//pending tests - use 'only' with describe
//skip tests - skip

describe('AuthController', function () {
    //nesting hooks
    beforeEach(function () {
        console.log('running before each');
        authController.setRoles(['user']);
    });

    // beforeEach('this function is erroring intentionally', function () {
    //     throw ({ error: 'error' });
    // });

    describe('isAuthorized', function () {
        // it('Should return false if not authorized', function () {
        //     // authController.setRoles(['user']);
        //     assert.equal(false, authController.isAuthorized('admin'));
        // });
        it('Should return false if not authorized', function () {
            // authController.setRoles(['user']);
            var isAuth = authController.isAuthorized('admin');
            assert.equal(false, isAuth);
            expect(isAuth).to.be.false;
        });
        it('Should return true if authorized', function () {
            authController.setRoles(['user', 'admin']);
            assert.equal(true, authController.isAuthorized('admin'));
        });
        it('should not allow a get if not authorized');
        it('should allow get if authorized');
    });

    describe('isAuthorizedAsync', function () {
        it('Should return false if not authorized', function (done) {
            // authController.setRoles(['user', 'admin']);
                authController.isAuthorizedAsync('admin', function (isAuth) {
                    assert.equal(false, isAuth);
                    done();
                });
        });
    });
});

