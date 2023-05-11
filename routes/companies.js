"use strict";

/** Routes for companies */

const express = require("express");
const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const router = express.Router();


/** GET request at "/companies" for list of companies
 * returns JSON like: {companies: [{code, name}, ...]}
*/
router.get("/", async function (req, res) {
  const result = await db.query(
    `SELECT code, name
      FROM companies`
  );

  return res.json({companies:result.rows})
})

/** GET specific company by code
 * returns JSON like: {company: {code, name, description}}
*/
router.get("/:code", async function (req, res) {
  const result = await db.query(
    `SELECT code, name, description
      FROM companies
        WHERE code = $1`,[req.params.code]
  );

  const company = result.rows[0];

  if (!company) {
    throw new NotFoundError("Company code not found");
  }

  return res.json({company});
})

/** Add a company
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


/** Edit existing company.
 * Needs to be given JSON like: {name, description}
 * Returns JSON with update company object like:
 * {company: {code, name, description}}
 */
router.put("/:code", async function (req, res) {
  if (!req.body) throw new BadRequestError("Invalid parameters");

  const { name, description } = req.body;

  const result = await db.query(
    `UPDATE companies
           SET name=$1,
               description=$2
           WHERE code = $3
           RETURNING code, name, description`,
    [name, description, req.params.code],
  );
  const company = result.rows[0];

  if (!company) {
    throw new NotFoundError("Company code not found");
  }

  return res.json({ company });
})

/** Deletes company.
 * Should return 404 if company cannot be found.
 * Returns JSON like: {status: "deleted"}
 * */
router.delete("/:code", async function (req, res) {
  const result = await db.query(
    `DELETE FROM companies WHERE code = $1
    RETURNING code`,
    [req.params.code]
  );

  if (result.rows.length === 0) {
    throw new NotFoundError("Company code not found");
  }

  return res.json({ status: "deleted" });
})

module.exports = router;