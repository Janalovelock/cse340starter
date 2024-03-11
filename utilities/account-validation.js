const utilities = require("../utilities")
const { body, validationResult } = require("express-validator")
const accountModel = require("../models/account-model")

const validate = {}

/*  **********************************
*  Registration Data Validation Rules
* ********************************* */
validate.registationRules = () => {
 return [
   // firstname is required and must be string
   body("account_firstname")
     .trim()
     .isLength({ min: 1 })
     .withMessage("Please provide a first name."), // on error this message is sent.

   // lastname is required and must be string
   body("account_lastname")
     .trim()
     .isLength({ min: 2 })
     .withMessage("Please provide a last name."), // on error this message is sent.

   // valid email is required and cannot already exist in the DB
   body("account_email")
   .trim()
   .isEmail()
   .normalizeEmail() // refer to validator.js docs
   .withMessage("A valid email is required.")
   .custom(async (account_email) => {
     const emailExists = await accountModel.checkExistingEmail(account_email)
     if (emailExists){
       throw new Error("Email exists. Please log in or use different email")
     }
   }),

   // password is required and must be strong password
   body("account_password")
     .trim()
     .isStrongPassword({
       minLength: 12,
       minLowercase: 1,
       minUppercase: 1,
       minNumbers: 1,
       minSymbols: 1,
     })
     .withMessage("Password does not meet requirements."),
 ]
}
/*  **********************************
*  Login Data Validation Rules
* ********************************* */
validate.loginRules = () => {
  return [
    // email is required and must be valid
    body("account_email")
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address."),
 
    // password is required
    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Password is required."),
  ]
 }

/*  **********************************
*  Add Classification Validation Rules
* ********************************* */
 validate.addClassificationRules = () => {
  return [
      // Validate classification name (cannot contain spaces or special characters)
      body('inv_make')
          .trim()
          .matches(/^[^\s!@#$%^&*()_+={}|:<>?~`]+$/)
          .withMessage('Classification name cannot contain spaces or special characters')
  ];
};

/* ******************************
 * REGISTER Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      res.render("account/register", {
        errors,
        title: "Registration",
        nav,
        account_firstname,
        account_lastname,
        account_email,
      })
      return
    }
    next()
  }

  /* ******************************
 * LOGIN Check data and return errors or continue to login
 * ***************************** */
validate.checkLoginData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    // If there are validation errors, render the login form again with error messages
    let nav = await utilities.getNav()
    return res.render("account/login", {
      errors: errors.array(),
      title: "Login",
      nav,
      account_email: req.body.account_email // Include the email entered by the user
    })
  }
  // If validation passes, proceed to the next middleware (e.g., login controller)
  next()
}
  
  module.exports = validate