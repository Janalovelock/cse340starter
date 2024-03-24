const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")
const { check, validationResult } = require('express-validator');
const accountValidation = require('../utilities/account-validation');
const express = require('express');
const { checkExistingEmail } = require("../models/account-model");
const router = express.Router();

const invCont = {}
/* ***************************
 *  build management page
 * ************************** */

invCont.renderManagement = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    const classificationsData = await invModel.getClassifications();
    let classificationDropdown = "<select id='classificationList' name='classification_id' required>";
    classificationDropdown += "<option value=''>Select a Classification</option>";

    classificationsData.rows.forEach((row) => {
        classificationDropdown += `
            <option value="${row.classification_id}">${row.classification_name}</option>
        `;
    });
    classificationDropdown += "</select>";

    res.render("./inventory/management", {
        title: "Inventory Management",
        nav,
        loggedIn: res.locals.loggedIn, // Access loggedIn from res.locals
        classificationDropdown: classificationDropdown,
    });
  } catch (error) {
    console.error("Error rendering management page:", error);
    next(error);
  }
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
/* Render the add-classification view */
invCont.renderAddClassification = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    // Pass classification_name and classification_error variables
    res.render("./inventory/add-classification", { 
      title: "Add Classification" ,
      nav,
      classification_name: req.query.classification_name || '', 
      classification_error: req.body.classification_error 
    });
  } catch (error) {
    console.error("Error rendering add-classification view:", error);
    next(error);
  }
}
/* ***************************
 * Add new classification function
 * ************************** */
/* Add new classification function */
invCont.addClassification = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      // If validation fails, set classification_name and classification_error variables
      req.query.classification_name = req.body.classification_name;
      req.body.classification_error = 'Classification name can only contain alphanumeric characters'; // Set classification_error here
      // Redirect back to the add-classification page with the classification name in the query parameter
      return res.redirect(`/inv/add-classification?classification_name=${encodeURIComponent(req.body.classification_name)}`);
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
      return res.render("./inventory/add-classification", { 
        title: "Add Classification",
        nav,
        classification_name: req.body.classification_name || '', // Use req.body to retain the value
        classification_error: 'Please try again! Classification name cannot contain spaces or special characters!' // Include classification_error here
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
    let classificationDropdown = "<select id='classification' name='classification_id' required>";
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
        classificationDropdown: classificationDropdown, // Pass classificationDropdown to the view
        errors: req.flash('error'), // Assuming you're using flash messages for errors
        formData: {} // Initialize formData object to avoid the "undefined" error
    });
  } catch (error) {
    console.error("Error rendering add-inventory view:", error);
    next(error);
  }
};
/* ***************************
 *Add new inventory item function
 * ************************** */


 // Add server-side validation logic to the addInventoryItem function
 invCont.addInventoryItem = async function (req, res, next) {
  try {
    // Fetch all classifications and construct dropdown HTML
    const classificationsData = await invModel.getClassifications();
    let classificationDropdown = "<select id='classification' name='classification_id' required>";
    classificationDropdown += "<option value=''>Select a Classification</option>";

    // Use classificationsData.rows instead of classificationsData
    classificationsData.rows.forEach((row) => {
        classificationDropdown += `
            <option value="${row.classification_id}">${row.classification_name}</option>
        `;
    });
    classificationDropdown += "</select>";

    // Log the classificationDropdown to check its content
    console.log("Classification Dropdown:", classificationDropdown);

    // Validate input fields
    const validationRules = [
        check('inv_make').trim().notEmpty().withMessage('Make is required'),
        check('inv_model').trim().notEmpty().withMessage('Model is required'),
        check('inv_year').trim().notEmpty().withMessage('Year is required').isInt({ min: 1900, max: new Date().getFullYear() }).withMessage('Invalid year'),
        check('inv_description').trim().notEmpty().withMessage('Description is required'),
        check('inv_price').trim().notEmpty().withMessage('Price is required'),
        check('inv_miles').trim().notEmpty().withMessage('Miles is required'),
        check('inv_color').trim().notEmpty().withMessage('Color is required'),
        check('inv_image').trim().notEmpty().withMessage('Image is required'),
        check('inv_thumbnail').trim().notEmpty().withMessage('Thumbnail is required'),
        check('classification_id').trim().notEmpty().withMessage('Classification ID is required'),
    ];
    await Promise.all(validationRules.map(validation => validation.run(req)));

    const errors = validationResult(req);
    console.log("Validation Errors:", errors.array()); // Log validation errors

    if (!errors.isEmpty()) {
        // If validation fails, render the add-inventory view with error messages and previously entered data
        let nav = await utilities.getNav();
        return res.render('./inventory/add-inventory', {
            title: 'Add Inventory',
            nav,
            classificationDropdown: classificationDropdown, // Pass classificationDropdown to the view
            errors: errors.array(), // Pass validation errors to the view
            formData: req.body // Pass the previously entered data to the view
        });
    }

    // If validation passes, proceed with adding the inventory item
    const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body;
    const newItem = await invModel.addInventoryItem(inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id);
    req.flash('success', 'Inventory item added successfully.');
    res.redirect('/inv');
  } catch (error) {
      console.error("Error adding inventory item:", error);
      let nav = await utilities.getNav();
      res.render("./inventory/add-inventory", {
        title: "Add Inventory",
        nav,
        classificationDropdown: classificationDropdown, // Pass classificationDropdown to the view
        errors: req.flash('error'), // Assuming you're using flash messages for errors
        formData: {} // Initialize formData object to avoid the "undefined" error
    });
  }
};

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}
/* ***************************
 * Render the edit-inventory view
 * ************************** */
invCont.renderEditInventory = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();

    // Fetch all classifications and construct dropdown HTML
    const classificationsData = await invModel.getClassifications();
    let classificationDropdown = "<select id='classification' name='classification_id' required>";
    classificationDropdown += "<option value=''>Select a Classification</option>";

    // Use classificationsData.rows instead of classificationsData
    classificationsData.rows.forEach((row) => {
        // Add 'selected' attribute if classification ID matches item's classification ID
        const selected = row.classification_id === req.params.classificationId ? 'selected' : '';
        classificationDropdown += `
            <option value="${row.classification_id}" ${selected}>${row.classification_name}</option>
        `;
    });
    classificationDropdown += "</select>";

    const itemId = parseInt(req.params.invId);
    console.log("Item ID:", itemId); // Add this console log

    // Retrieve item data from the database
    const itemData = await invModel.getInventoryItemDetail(itemId);
    console.log("Item Data:", itemData); // Add this console log

    // Check if itemData is not empty
    if (!itemData) {
      throw new Error("Item not found");
    }

    // Generate item name
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`;
    console.log("Item Name:", itemName); // Add this console log

    // Pass formData with itemData to retain the values in the form
    const formData = {
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_description: itemData.inv_description,
      inv_image: itemData.inv_image,
      inv_thumbnail: itemData.inv_thumbnail,
      inv_price: itemData.inv_price,
      inv_miles: itemData.inv_miles,
      inv_color: itemData.inv_color,
      classification_id: itemData.classification_id
    };

    // Render the edit-inventory view and pass the necessary data
    res.render("./inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationsData: classificationsData,
      errors: null,
      inv_id: itemData.inv_id,
      classificationDropdown: classificationDropdown,
      formData: formData, // Pass formData object
      itemData: itemData, // Make sure itemData is passed to the template
    });
  } catch (error) {
    console.error("Error rendering edit-inventory view:", error);
    next(error);
  }
};


/* ***************************
 *update item function
 * ************************** */


 // Add server-side validation logic to the addInventoryItem function
 invCont.updateInventoryItem = async function (req, res, next) {
  try {
    // Fetch all classifications and construct dropdown HTML
    const classificationsData = await invModel.getClassifications();
    let classificationDropdown = "<select id='classification' name='classification_id' required>";
    classificationDropdown += "<option value=''>Select a Classification</option>";

    // Use classificationsData.rows instead of classificationsData
    classificationsData.rows.forEach((row) => {
        classificationDropdown += `
            <option value="${row.classification_id}">${row.classification_name}</option>
        `;
    });
    classificationDropdown += "</select>";

    // Log the classificationDropdown to check its content
    console.log("Classification Dropdown:", classificationDropdown);

    // Validate input fields
    const validationRules = [
        check('inv_make').trim().notEmpty().withMessage('Make is required'),
        check('inv_model').trim().notEmpty().withMessage('Model is required'),
        check('inv_year').trim().notEmpty().withMessage('Year is required').isInt({ min: 1900, max: new Date().getFullYear() }).withMessage('Invalid year'),
        check('inv_description').trim().notEmpty().withMessage('Description is required'),
        check('inv_price').trim().notEmpty().withMessage('Price is required'),
        check('inv_miles').trim().notEmpty().withMessage('Miles is required'),
        check('inv_color').trim().notEmpty().withMessage('Color is required'),
        check('inv_image').trim().notEmpty().withMessage('Image is required'),
        check('inv_thumbnail').trim().notEmpty().withMessage('Thumbnail is required'),
        check('classification_id').trim().notEmpty().withMessage('Classification ID is required'),
    ];
    await Promise.all(validationRules.map(validation => validation.run(req)));

    const errors = validationResult(req);
    console.log("Validation Errors:", errors.array()); // Log validation errors

    if (!errors.isEmpty()) {
        // If validation fails, render the edit-inventory view with error messages and previously entered data
        let nav = await utilities.getNav();
        return res.render('./inventory/edit-inventory', {
            title: 'Edit Inventory',
            nav,
            classificationDropdown: classificationDropdown, // Pass classificationDropdown to the view
            errors: errors.array(), // Pass validation errors to the view
            formData: req.body // Pass the previously entered data to the view
        });
    }

    // If validation passes, proceed with updating the inventory item
    const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body;
    const inv_id = req.body.inv_id; // Get the inv_id from the request body
    const updatedItem = await invModel.updateInventoryItem(inv_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id);
    req.flash('success', 'Inventory item updated successfully.');
    res.redirect('/inv');
  } catch (error) {
      console.error("Error updating inventory item:", error);
      let nav = await utilities.getNav();
      res.render("./inventory/edit-inventory", {
        title: "Edit Inventory",
        nav,
        classificationDropdown: classificationDropdown, // Pass classificationDropdown to the view
        errors: req.flash('error'), // Assuming you're using flash messages for errors
        formData: {} // Initialize formData object to avoid the "undefined" error
    });
  }
};

/* ***************************
 * Render the delete-confirm view
 * ************************** */
invCont.renderDeleteInventory = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();

    const itemId = parseInt(req.params.invId);
    console.log("Item ID:", itemId); // Add this console log

    // Retrieve item data from the database
    const itemData = await invModel.getInventoryItemDetail(itemId);
    console.log("Item Data:", itemData); // Add this console log

    // Check if itemData is not empty
    if (!itemData) {
      throw new Error("Item not found");
    }

    // Generate item name
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`;
    console.log("Item Name:", itemName); // Add this console log

    // Pass formData with itemData to retain the values in the form
    const formData = {
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_price: itemData.inv_price,
    };

    // Render the edit-inventory view and pass the necessary data
    res.render("./inventory/delete-confirm", {
      title: "Delete " + itemName,
      nav,
      errors: null,
      inv_id: itemData.inv_id,
      formData: formData, // Pass formData object
      itemData: itemData, // Make sure itemData is passed to the template
    });
  } catch (error) {
    console.error("Error rendering delete confirmation view:", error);
    next(error);
  }
};
/* ***************************
 *delete item function
 * ************************** */


 // Add server-side validation logic to the addInventoryItem function
 invCont.deleteInventoryItem = async function (req, res, next) {
  try {
//    const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body;
    const inv_id = req.params.inv_id; // Get the inv_id from the request body
    await invModel.deleteInventoryItem(inv_id);
    req.flash('success', 'Inventory item deleted successfully.');
    res.redirect('/inv');
  } catch (error) {
    // Handle error
    console.error("Error deleting inventory item:", error);
    // Set flash message for error (if using flash messages)
    req.flash('error', 'Error deleting inventory item.');
    // Redirect back to the delete confirmation page or handle the error appropriately
    res.redirect(`/delete-confirm/${req.body.inv_id}`);
}
};


module.exports = invCont;
