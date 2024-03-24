const express = require("express");
const router = new express.Router();
const accountController = require("../controllers/accountController");
const errorController = require("../controllers/errorController");
const utilities = require("../utilities");
const regValidate = require('../utilities/account-validation');



// Apply the checkJWTToken middleware to all routes in this router




// GET route for the "My Account" link
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildAccountManagement))

router.get("/account-management", accountController.buildAccountManagement);

router.get("/login", utilities.handleErrors(accountController.buildLogin));
router.get("/register", utilities.handleErrors(accountController.buildRegister));
router.get('/trigger-error', errorController.triggerError);

// Logout route
router.get("/logout", accountController.logout);

// Process the registration data
router.post(
    "/register",
    regValidate.registationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
);

// Process the login attempt
router.post(
    "/login",
    regValidate.loginRules(),
    regValidate.checkLoginData,
    utilities.handleErrors(accountController.accountLogin)
);

module.exports = router;