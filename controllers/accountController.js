const utilities = require("../utilities/")
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const { getAccountById } = require("../models/account-model");

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
  let nav = await utilities.getNav();
  const username = res.locals.accountData.account_firstname
  res.render("account/account-management", {
      title: "Account Management",
      nav,
      username,
      errors: null,
  })
}
/* ****************************************
*  Deliver account management page
* *************************************** */

async function buildUpdateAccount(req, res, next) {
  console.log("URL Parameters:", req.params); // Add this line to see all URL parameters
  const account_id = parseInt(req.params.account_id);
  console.log("Parsed Account ID:", account_id); // Add this line to see the parsed account ID
  const data = await accountModel.getAccountById(account_id);
  let nav = await utilities.getNav();
  res.render("account/update", {
      title: "Edit Account",
      nav,
      errors: null,
      account_firstname: data.account_firstname,
      account_lastname: data.account_lastname,
      account_email: data.account_email,
      account_id: data.account_id,
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

async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
      req.flash("notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
          title: "Login",
          nav,
          errors: null,
          account_email,
      })
      return
  }
  try {
      if (await bcrypt.compare(account_password, accountData.account_password)) {
          delete accountData.account_password
          console.log("Before signing jwt:", accountData); // Add this line
          const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
          console.log("After signing jwt:", accessToken); // Add this line
          if(process.env.NODE_ENV === 'development') {
              res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
          } else {
              res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
          }
          return res.redirect("/account/")
      }
  } catch (error) {
      console.error("Error while generating jwt:", error); // Add this line
      return new Error('Access Forbidden')
  }
}


/* ****************************************
 *  update account
 * ************************************ */
async function updateAccountForm(req, res, next) {
  try {
    // Extract accountId from request parameters
    const accountId = req.params.accountId;

    console.log("Account ID:", accountId); // Add this line

    // Assuming you have a function to fetch account data by accountId
    const accountData = await accountModel.getAccountById(accountId);

    console.log("Account Data:", accountData); // Add this line

    // Check if accountData exists
    if (!accountData) {
      // Handle case where account data is not found
      console.log("Account data not found"); // Add this line
      return res.status(404).send("Account not found");
    }

    // Render the update account information form with account data
    res.render("account/update-account", {
      title: "Update Account Information",
      accountData: accountData, // Pass accountData to the view
      errors: null,
      account_firstname: accountData.account_firstname, // Pass account_firstname to the view
    });
  } catch (error) {
    console.error("Error rendering update account form:", error);
    next(error);
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



  module.exports = {getAccountById, buildUpdateAccount, updateAccountForm, buildLogin, buildRegister, registerAccount, accountLogin, buildAccountManagement, logout}