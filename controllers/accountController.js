const utilities = require("../utilities/")
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
      title: "Login",
      nav, // Use nav here
      errors: null,
      account_email: "", // Assuming you want to clear the email field
  });
}

  /* ****************************************
*  Deliver register view
* *************************************** */

async function buildRegister(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/register", {
      title: "Register",
      nav,
      errors: null,
    })
  }
  /* ****************************************
*  Deliver account management page
* *************************************** */

async function buildAccountManagement(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/account-management", {
    title: "Account Management",
    nav,
    errors: null,

  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

// Hash the password before storing
let hashedPassword
try {

  hashedPassword = await bcrypt.hashSync(account_password, 10)
} catch (error) {
  req.flash("notice", 'Sorry, there was an error processing the registration.')
  res.status(500).render("account/register", {
    title: "Registration",
    nav,
    errors: null,
  })
}

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */

const accountLogin = async (req, res) => {
  console.log("Inside accountLogin function");

  const { account_email, account_password } = req.body;

  try {
    const accountData = await accountModel.getAccountByEmail(account_email);
    console.log("Retrieved accountData:", accountData);
    if (!accountData) {
      console.log("No account found");
      req.flash("notice", "Please check your credentials and try again.");
      return res.redirect("/account/login");
    }

    const isPasswordValid = await bcrypt.compare(account_password, accountData.account_password);

    if (isPasswordValid) {
      console.log("Password is correct");

      // Include user's role in the JWT token payload
      const token = jwt.sign(
        { 
          account_email: accountData.account_email, 
          account_type: accountData.account_type,
          // Assuming account_type represents the user's role
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '1h' }
      );
      console.log("Generated token:", token);

      res.cookie('jwt', token, { httpOnly: true });
      console.log("JWT cookie set successfully.");

      // Set the loggedIn flag in locals to true
      res.locals.loggedIn = true;
      console.log('accountController says its loggedIn:', res.locals.loggedIn);
      return res.redirect("/account/account-management");
    } else {
      console.log("Incorrect password");
      req.flash("notice", "Please check your credentials and try again.");
      return res.redirect("/account/login");
    }
  } catch (error) {
    console.error("Error in accountLogin:", error);
    req.flash("error", "An error occurred. Please try again later.");
    return res.redirect("/account/login");
  }
}

/* ****************************************
 *  Process logout
 * ************************************ */

async function logout(req, res) {
  // Clear the JWT cookie
  res.clearCookie("jwt");
  // Redirect to the login page
  res.redirect("/account/login");
}



  module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildAccountManagement, logout}