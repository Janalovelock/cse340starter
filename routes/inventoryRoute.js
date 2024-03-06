// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const errorController = require("../controllers/errorController")

router.get("/", invController.renderManagement);
// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);
router.get("/detail/:itemId", invController.getInventoryItemDetail);
router.get('/trigger-error', errorController.triggerError);
router.get("/add-classification", invController.renderAddClassification);



module.exports = router;