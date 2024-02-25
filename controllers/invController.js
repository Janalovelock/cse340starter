const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

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


module.exports = invCont