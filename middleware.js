"use strict";
/** Functions that help with routes */

const db = require("./db.js");
const { NotFoundError, BadRequestError } = require("./expressError.js");

/** check if company is in database, if so continue
 *  else 404 error
 */
async function findCompany(req, res, next) {
  const results = await db.query(
    `SELECT code, name, description
      FROM companies
        WHERE code = $1`, [req.params.code]
  );
  const company = results.rows[0];
  console.log("company=", company);
  if (!company) {
    throw new NotFoundError("Company code not found")
  } else {
    return next();
  }
}


module.exports = { findCompany };