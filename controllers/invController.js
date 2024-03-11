const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")
const { validationResult } = require('express-validator');
const accountValidation = require('../utilities/account-validation');
const express = require('express');
const router = express.Router();

const invCont = {}
/* ***************************
 *  build management page
 * ************************** */
invCont.renderManagement = async function (req, res, next) {
  let nav = await utilities.getNav();
  res.render("./inventory/management", {
      title: "Inventory Management",
      nav,
  });
};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classificationId;
    const data = await invModel.getInventoryByClassificationId(classification_id);
    let nav = await utilities.getNav();

    if (data.length > 0) {
      const className = data[0].classification_name;
      const grid = await utilities.buildClassificationGrid(data);
      res.render("./inventory/classification", {
        title: className + " vehicles",
        nav,
        grid,
      });
    } else {
      // Handle case where no data is returned for the classification
      res.render("./inventory/classification", {
        title: "No Vehicles Found",
        nav,
        grid: '<p class="notice">Sorry, no vehicles could be found for this classification.</p>',
      });
    }
  } catch (error) {
    console.error("Error building classification view:", error);
    next(error);
  }
};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.getInventoryItemDetail = async function (req, res, next) {
  const itemId = req.params.itemId
  const data = await invModel.getInventoryItemDetail(itemId)
  const grid = await utilities.generateInventoryItemHTML(data)
  let nav = await utilities.getNav()
  const className = data[0].inv_make + " - " + data[0].inv_model
  res.render("./inventory/vehicledetails", {
    title: className + " vehicles",
    nav,
    grid,
  })
}
/* ***************************
 * Render the add-classification view
 * ************************** */
invCont.renderAddClassification = async function (req, res, next) {
  let nav = await utilities.getNav()
  //const classificationName = req.body

    // Your logic to render the add-classification view goes here
    //const data = await invModel.addClassification(classificationName)

    res.render("./inventory/add-classification", { 
      title: "Add Classification" ,
      nav,
    });
  


}

/* ***************************
 * Add new classification function
 * ************************** */
invCont.addClassification = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      // If validation fails, render the add-classification view with error messages
      let nav = await utilities.getNav();
      return res.render('./inventory/add-classification', {
          title: 'Add Classification',
          nav,
          errors: errors.array()
      });
  }

  // If validation passes, insert the new classification into the database
  try {
      // Retrieve classification name from request body
      const { classification_name } = req.body;
      console.log("Adding classification:", classification_name); // Add this console log

      // Insert classification into the database
      const data = await invModel.addClassification(classification_name);
      console.log("Classification added successfully:", data); // Add this console log

      // Redirect to the management page with a success message
      req.flash('success', 'Classification added successfully.');
      res.redirect('/inv');
  } catch (error) {
      // If an error occurs during database operation, render the add-classification view with an error message
      console.error("Error adding classification:", error); // Add this console log

      let nav = await utilities.getNav();
      return res.render('./inventory/add-classification', {
          title: 'Add Classification',
          nav,
          errors: [{ msg: 'Failed to add classification. Please try again later.' }]
      });
  }
};
/* ***************************
 * Render the add-inventory view
 * ************************** */

invCont.renderAddInventory = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();

    // Fetch all classifications and construct dropdown HTML
    const classificationsData = await invModel.getClassifications();
    let classificationDropdown = "<select id='classification' name='classification' required>";
    classificationDropdown += "<option value=''>Select a Classification</option>";

    // Use classificationsData.rows instead of classificationsData
    classificationsData.rows.forEach((row) => {
      classificationDropdown += `
        <option value="${row.classification_id}">${row.classification_name}</option>
      `;
    });
    classificationDropdown += "</select>";

    // Render the add-inventory view and pass the dropdown HTML
    res.render("./inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationDropdown: classificationDropdown,
    });
  } catch (error) {
    console.error("Error rendering add-inventory view:", error);
    next(error);
  }
};
/* ***************************
 *Add new inventory item function
 * ************************** */
invCont.addInventoryItem = async function (req, res, next) {
 const errors = validationResult(req);
 if (!errors.isEmpty()) {
   let nav = await utilities.getNav();
   return res.render('./inventory/add-inventory', {
     title: 'Add Inventory',
     nav,
     errors: errors.array()
   });
 }

 try {
   const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body;
   const newItem = await invModel.addInventoryItem(inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id);
   req.flash('success', 'Inventory item added successfully.');
   res.redirect('/inv');
 } catch (error) {
   console.error("Error adding inventory item:", error);
   let nav = await utilities.getNav();
   return res.render('./inventory/add-inventory', {
     title: 'Add Inventory',
     nav,
     errors: [{ msg: 'Failed to add inventory item. Please try again later.' }]
   });
 }
};

module.exports = invCont;
