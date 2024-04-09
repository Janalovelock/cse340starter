const invModel = require("../models/inventory-model");
const Util = {};
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications();
  console.log(data);
  let list = "<ul>";
  list += '<li><a href="/" title="Home page">Home</a></li>';
  data.rows.forEach((row) => {
    list += "<li>";
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>";
    list += "</li>";
  });
  list += "</ul>";
  return list;
};

/* **************************************
 * Build the classification view HTML
 * ************************************ */
Util.buildClassificationGrid = async function (data) {
  let grid = "";
  if (data.length > 0) {
    grid = '<ul id="inv-display">';
    data.forEach((vehicle) => {
      grid += "<li>";
      grid += '<div class="namePrice">';
      grid += "<h2>";
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' details">' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        "</a>";
      grid += "</h2>";
      grid +=
        "<span>$" +
        new Intl.NumberFormat("en-US").format(vehicle.inv_price) +
        "</span>";
      grid += "</div>";
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        'details"><img src="' +
        vehicle.inv_thumbnail +
        '" alt="Image of ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' on CSE Motors"></a>';
      grid += "<hr>";
      grid += "</li>";
    });
    grid += "</ul>";
  } else {
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  return grid;
};

/* **************************************
 * Get HTML content for a specific inventory item
 * ************************************ */
Util.generateInventoryItemHTML = async function (itemId) {
  try {
    if (itemId) {
      let htmlContent = `<div class="item-details">
                            <h2>${itemId[0].inv_make} ${itemId[0].inv_model}</h2>
                            <div class="item-info">
                            <img src="${itemId[0].inv_image}" alt="${itemId[0].inv_make} ${itemId[0].inv_model}">
                            <div class="detail-info">
                            <p class="detail">Year: ${itemId[0].inv_year}</p>
                            <p class="detail">Price: $${new Intl.NumberFormat("en-US").format(itemId[0].inv_price)}</p>
                            <p class="detail">Mileage: ${new Intl.NumberFormat().format(itemId[0].inv_miles)}</p>
                            <p class="detail">Description: ${itemId[0].inv_description}</p>
                            </div>
                            </div>
                          </div>`;
      return htmlContent;
    } else {
      return '<p class="notice">Sorry, the requested vehicle could not be found.</p>';
    }
  } catch (error) {
    console.error("Error generating HTML for inventory item:", error);
    return '<p class="error">An error occurred while generating HTML for the inventory item.</p>';
  }
};
/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => {
  return Promise.resolve(fn(req, res, next))
    .catch(error => {
      console.error('Error caught in handleErrors middleware:', error);
      next(error); // Forward the error to the next error handling middleware
    });
};
/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(
    req.cookies.jwt,
    process.env.ACCESS_TOKEN_SECRET,
    function (err, accountData) {
      if (err) {
        req.flash("Please log in")
        res.clearCookie("jwt")
        return res.redirect("/account/login")
      }
      res.locals.accountData = accountData
      res.locals.loggedin = 1
      next()
    })
  } else {
    next()
  }
}
/* ****************************************
 *  Check Login Middleware
 * ************************************ */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
}
/* ****************************************
 *  Check account type
 * ************************************ */
Util.checkAccountType = (req, res, next) => {
  const accountType = res.locals.accountData.account_type
  if (accountType == 'Admin' || accountType == 'Employee') {
    next()
  } else {
    req.flash("notice", "Please log in with an admin account")
    return res.redirect("/account/login")
  }
}
module.exports = Util;
