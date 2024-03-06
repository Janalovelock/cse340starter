const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

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
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

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

    // Your logic to render the add-classification view goes here
    res.render("./inventory/add-classification", { 
      title: "Add Classification" ,
      nav,
    });


}
module.exports = invCont;

