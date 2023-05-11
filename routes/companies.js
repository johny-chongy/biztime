"use strict";

/** Routes for companies */

const express = require("express");
const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { findCompany } = require("../middleware");
const router = express.Router();


/** GET request at "/companies" for list of companies */
router.get("/", async function (req, res) {
  const results = await db.query(
    `SELECT code, name
      FROM companies`
  );

  return res.json({companies:results.rows})
})

/** GET specific company by code */
router.get("/:code",async function (req, res) {
  console.log("code=", req.params.code);
  const results = await db.query(
    `SELECT code, name, description
      FROM companies
        WHERE code = $1`,[req.params.code]
  );

  if (results.rows.length === 0) {
    throw new NotFoundError("test");
  }

  const company = results.rows[0];

  return res.json({company});
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