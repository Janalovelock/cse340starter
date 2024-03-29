const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
  }

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}
/* ***************************
 *  Get all inventory items by iD
 * ************************** */
async function getInventoryItemDetail(itemId) {
  try {
    const data = await pool.query(
      `SELECT * FROM inventory WHERE inv_id = $1`,
      [itemId]
    )
    return data.rows[0];
  } catch (error) {
    console.error("Error fetching inventory item:" + error)
    throw new Error("Error fetching inventory item");
  }
}
/* ***************************
add Classification
 * ************************** */
async function addClassification(classification_name) {
  try {
    // Validate classification_name
    const isValid = /^[a-zA-Z0-9]+$/.test(classification_name);
    if (!isValid) {
      throw new Error('Classification name can only contain alphanumeric characters');
    }

    // Log the SQL query and parameters before executing
    console.log('SQL Query:', 'INSERT INTO public.classification (classification_name) VALUES ($1) RETURNING *', 'Parameters:', [classification_name]);

    // Execute the SQL query
    const result = await pool.query('INSERT INTO public.classification (classification_name) VALUES ($1) RETURNING *', [classification_name]);

    // Log the result (optional)
    console.log('Classification added successfully:', result.rows[0]);

    return result.rows[0];
  } catch (error) {
    // Log error details
    console.error('Error adding classification:', error.message); // Log the error message
    console.error('Error details:', error); // Log the entire error object

    throw new Error('Error adding classification');
  }
}
/* ***************************
add inventory item
 * ************************** */

async function addInventoryItem(inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id) {
  try {
    // Construct SQL query to insert inventory item
    const query = `
      INSERT INTO public.inventory (inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;

    // Execute SQL query with parameters
    const result = await pool.query(query, [inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id]);

    // Return the newly inserted inventory item
    return result.rows[0];
  } catch (error) {
    // Handle database errors
    throw new Error("Error adding inventory item: " + error.message);
  }
}

/* ***************************
Update inventory item
 * ************************** */

async function updateInventoryItem(inv_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id) {
  try {
    // Construct SQL query to update inventory item
    const query = `
      UPDATE public.inventory 
      SET inv_make = $1, inv_model = $2, inv_description = $3, inv_image = $4, inv_thumbnail = $5, inv_price = $6, inv_year = $7, inv_miles = $8, inv_color = $9, classification_id = $10 
      WHERE inv_id = $11 
      RETURNING *;
    `;

    // Execute SQL query with parameters
    const result = await pool.query(query, [inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, classification_id, inv_id]);

    // Return the updated inventory item
    return result.rows[0];
  } catch (error) {
    // Handle database errors
    throw new Error("Error updating inventory item: " + error.message);
  }
}


/* ***************************
Delete inventory item
 * ************************** */

async function deleteInventoryItem(inv_id) {
  try {
    // Construct SQL query to update inventory item
    const query = `
      DELETE FROM inventory WHERE inv_id = $1
    `;

    // Execute SQL query with parameters
    await pool.query(query, [inv_id]);


  } catch (error) {
    // Handle database errors
    throw new Error("Error deleting inventory item: " + error.message);
  }
}


module.exports = {getClassifications, getInventoryByClassificationId, getInventoryItemDetail, addClassification, addInventoryItem, updateInventoryItem, deleteInventoryItem};
