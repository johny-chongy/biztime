"use strict";

/** Routes for companies */

const express = require("express");
const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { findCompany } = require("../middleware");
const router = express.Router();


/** GET request at "/companies" for list of companies
 * returns JSON like: {companies: [{code, name}, ...]}
*/
router.get("/", async function (req, res) {
  const results = await db.query(
    `SELECT code, name
      FROM companies`
  );

  return res.json({companies:results.rows})
})

/** GET specific company by code
 * returns JSON like: {company: {code, name, description}}
*/
router.get("/:code", async function (req, res) {
  const results = await db.query(
    `SELECT code, name, description
      FROM companies
        WHERE code = $1`,[req.params.code]
  );

  if (results.rows.length === 0) {
    throw new NotFoundError("Company code not found");
  }

  const company = results.rows[0];

  return res.json({company});
})

/** add a company
 * Needs to be given JSON like: {code, name, description}
 * returns JSON like: {code, name, description}
*/
router.post("/", async function (req, res) {
  if (!req.body) throw new BadRequestError("Invalid parameters");

  const { code, name, description } = req.body;
  const result = await db.query(
    `INSERT INTO companies (code, name, description)
           VALUES ($1, $2, $3)
           RETURNING code, name, description`,
    [code, name, description]
  );
  const company = result.rows[0];
  
  return res.status(201).json({ company });
})



// /** check if company is in database, if so continue
//  *  else 404 error
//  */
// async function findCompany(companyCode) {
//   const results = await db.query(
//     `SELECT code, name, description
//       FROM companies
//         WHERE code = $1`, [companyCode]
//   );
//   const company = results.rows[0];
//   console.log("company=", company);
//   if (company === undefined) {
//     throw new NotFoundError("Company code not found")
//   } else {
//     return company;
//   }
// }


module.exports = router;