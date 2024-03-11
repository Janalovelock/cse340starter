// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const errorController = require("../controllers/errorController")
const { check } = require('express-validator');


const utilities = require("../utilities")

console.log(invController.renderManagement);

router.get("/", invController.renderManagement);
// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));
router.get("/detail/:itemId", utilities.handleErrors(invController.getInventoryItemDetail));
router.get('/trigger-error', errorController.triggerError);
router.get("/add-classification", utilities.handleErrors(invController.renderAddClassification));
router.post('/add-classification', utilities.handleErrors(invController.addClassification));


router.get('/add-inventory', utilities.handleErrors(invController.renderAddInventory));
router.post('/add-inventory', utilities.handleErrors(invController.addInventoryItem));
//accountValidation.checkAddClassification, 

// Define your inventory routes
// Route to render the add classification page

//routes for adding inventory




module.exports = router;