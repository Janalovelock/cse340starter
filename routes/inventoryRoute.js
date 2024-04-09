const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const errorController = require("../controllers/errorController");
const utilities = require("../utilities");

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));
router.get("/detail/:itemId", utilities.handleErrors(invController.getInventoryItemDetail));
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON));

// Apply the authentication middleware to the following routes
router.use(utilities.checkLogin);

// The following require an admin or employee account to complete
router.get("/", utilities.checkAccountType, utilities.handleErrors(invController.renderManagement));
router.get("/add-classification", utilities.checkAccountType, utilities.handleErrors(invController.renderAddClassification));
router.post('/add-classification', utilities.handleErrors(invController.addClassification));
router.get('/add-inventory', utilities.checkAccountType, utilities.handleErrors(invController.renderAddInventory));
router.post('/add-inventory', utilities.handleErrors(invController.addInventoryItem));
router.post("/update/", utilities.handleErrors(invController.updateInventoryItem));
router.get('/edit/:invId',utilities.checkAccountType, utilities.handleErrors(invController.renderEditInventory));
router.get('/delete/:invId', utilities.checkAccountType, utilities.handleErrors(invController.renderDeleteInventory));
router.post("/delete/:invId", utilities.handleErrors(invController.deleteInventoryItem));

module.exports = router;