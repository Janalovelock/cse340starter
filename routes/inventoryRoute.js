// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const errorController = require("../controllers/errorController")
const accountValidation = require('../utilities/account-validation');

console.log(invController.renderManagement);

router.get("/", invController.renderManagement);
// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);
router.get("/detail/:itemId", invController.getInventoryItemDetail);
router.get('/trigger-error', errorController.triggerError);
router.get("/add-classification", invController.renderAddClassification);
router.post('/add-classification', invController.addClassification);
router.get('/add-inventory', invController.renderAddInventory);
router.post('/add-inventory', invController.addInventoryItem);
//accountValidation.checkAddClassification, 

// Define your inventory routes
// Route to render the add classification page

//routes for adding inventory




module.exports = router;