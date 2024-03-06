const express = require("express");
const router = new express.Router();
const accountController = require("../controllers/accountController");
const errorController = require("../controllers/errorController");
const utilities = require("../utilities")
const regValidate = require('../utilities/account-validation')

// GET route for the "My Account" link
router.get("/login", utilities.handleErrors(accountController.buildLogin));
router.get("/register", utilities.handleErrors(accountController.buildRegister));
router.get('/trigger-error', errorController.triggerError);
router.post('/register', utilities.handleErrors(accountController.registerAccount))

// Process the registration data
router.post(
    "/register",
    regValidate.registationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
  )

module.exports = router;