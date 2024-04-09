const express = require("express");
const router = new express.Router();
const accountController = require("../controllers/accountController");
const errorController = require("../controllers/errorController");
const utilities = require("../utilities");
const regValidate = require('../utilities/account-validation');

// GET route for the "My Account" link
router.get("/",  
utilities.checkLogin,
utilities.handleErrors(accountController.buildAccountManagement));

// Define the login and register routes
router.get("/login", utilities.handleErrors(accountController.buildLogin));
router.get("/register", utilities.handleErrors(accountController.buildRegister));
router.get("/account-management", utilities.handleErrors(accountController.buildAccountManagement))
// Logout route
router.get("/logout", accountController.logout);
router.get("/update/:account_Id", utilities.checkLogin, utilities.handleErrors(accountController.buildUpdateAccount));

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
router.post("/update", utilities.checkLogin, utilities.handleErrors(accountController.updateAccount));

module.exports = router;