const express = require("express");
const router = new express.Router();
const accountController = require("../controllers/accountController");
const errorController = require("../controllers/errorController");
const utilities = require("../utilities");
const regValidate = require('../utilities/account-validation');

// GET route for the "My Account" link
router.get("/",  utilities.handleErrors(accountController.buildAccountManagement));

// Define the login and register routes
router.get("/login", utilities.handleErrors(accountController.buildLogin));
router.get("/register", utilities.handleErrors(accountController.buildRegister));
router.get("/account-management", utilities.handleErrors(accountController.buildAccountManagement))
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