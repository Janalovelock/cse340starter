// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const errorController = require("../controllers/errorController")
const { check } = require('express-validator');


const utilities = require("../utilities")

console.log(invController.renderManagement);

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));
router.get("/detail/:itemId", utilities.handleErrors(invController.getInventoryItemDetail));
router.get('/trigger-error', errorController.triggerError);
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))
router.use(utilities.checkLogin);

//The following require an admin or employee account to complete
router.get("/", utilities.handleErrors(invController.renderManagement));



router.get("/add-classification", utilities.handleErrors(invController.renderAddClassification));
router.post('/add-classification', utilities.handleErrors(invController.addClassification));

router.get('/add-inventory', utilities.handleErrors(invController.renderAddInventory));
router.post('/add-inventory', utilities.handleErrors(invController.addInventoryItem));

router.post("/update/", utilities.handleErrors(invController.updateInventoryItem));
router.get('/edit/:invId', utilities.handleErrors(invController.renderEditInventory));

router.get('/delete/:invId', utilities.handleErrors(invController.renderDeleteInventory));
router.post("/delete/:invId", utilities.handleErrors(invController.deleteInventoryItem));

module.exports = router;
