/* ******************************************
 * This server.js file is the primary file of the 
* application. It is used to control the project.
*******************************************/
/* ***********************
* Require Statements
*************************/
const express = require("express");
const expressLayouts = require('express-ejs-layouts');
const env = require("dotenv").config();
const app = express();
const static = require("./routes/static");
const utilities = require('./utilities');
const inventoryRoute = require("./routes/inventoryRoute");
const accountRoute = require("./routes/accountRoute");
const baseController = require("./controllers/baseController");
const session = require("express-session");
const pool = require('./database/');
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const accountController = require("./controllers/accountController");
const { registerAccount } = require("./models/account-model")
const jwt = require('jsonwebtoken')
//const { addClassification } = require("./models/inventory-model")
//const { addInventoryItem}  = require("./models/inventory-model")
// Set up session and body parser middleware

/* ***********************
 * Middleware
 * ************************/
app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}))
// Express Messages Middleware
app.use(require('connect-flash')())
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res)
  next()
})
//Parsing
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

// Middleware to check if user is logged in
app.use((req, res, next) => {
  // Check if req.cookies exists and if req.cookies.jwt is truthy
  if (req.cookies && req.cookies.jwt) {
    try {
      // Verify JWT token
      const decodedToken = jwt.verify(req.cookies.jwt, process.env.ACCESS_TOKEN_SECRET);
      if (decodedToken) {
        // If token is valid, set loggedIn to true
        res.locals.loggedIn = true;
      }
    } catch (error) {
      // If token is invalid, clear cookie and set loggedIn to false
      console.error('Error verifying JWT token:', error);
      res.clearCookie('jwt');
      res.locals.loggedIn = false;
    }
  } else {
    // If req.cookies or req.cookies.jwt doesn't exist, set loggedIn to false
    res.locals.loggedIn = false;
  }
  next();
});

/* ***********************
 * View Engine and templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout") // not at views root

/* ***********************
 * Routes
 *************************/
app.use(static)
//Index Route
/* old function
app.get("/", function(req, res){
  res.render("index", {title: "Home"})
})*/
app.get("/", baseController.buildHome)
// Inventory routes

app.use("/inv", inventoryRoute);

// Account routes
app.use("/account", require("./routes/accountRoute"));
app.use("/account", registerAccount); 
//app.use("/inv/add-classification", addClassification);
//app.use("/inv/add-inventory", addInventoryItem);


// Error handling middleware
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav();
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);
  res.render("errors/error", {
    title: err.status || 'Server Error',
    message: err.message,
    nav
  });
});


// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({status: 500, message: "This is awkward! You've found an error!"})
});

/* ***********************
 * Local Server Information
* Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
*************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`);
});

/* ***********************
* Express Error Handler
* Place after all other middleware
*************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav();
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);
  if (err.status == 404) { message = err.message } else { message = 'Oh no! There was a crash. Maybe try a different route?' }
  res.render("errors/error", {
    title: err.status || 'Server Error',
    message,
    nav
  });
});