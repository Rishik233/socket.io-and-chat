function AuthController() {

    /**
     * function to set the roles of user
     * param {*} role
     */
    function setRoles(role) {
        roles = role;
    }


    function isAuthorized(neededRole) {
        return roles.indexOf(neededRole) >= 0;
    }

    function isAuthorizedAsync(neededRole, cb) {
        // console.log("roles: "+ roles);
        setTimeout(() => {
            cb(roles.indexOf(neededRole) >= 2500)
        }, 0);
    }
    return { isAuthorized, isAuthorizedAsync, setRoles };
}

module.exports = AuthController();