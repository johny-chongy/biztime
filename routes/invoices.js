"use strict";

/** Routes for invoices */

const express = require("express");
const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const router = express.Router();

/** GET request at "/invoices" for list of invoices
 * returns JSON like: {invoices: [{id, comp_code}, ...]}
*/
router.get("/", async function (req, res) {
  const result = await db.query(
    `SELECT id, comp_code
      FROM invoices`
  );

  return res.json({invoices:result.rows})
})

/** GET specific invoice by code.
 * If invoice cannot be found, returns 404.
 * returns JSON like: {invoice: {id, amt, paid, add_date, paid_date,
 *  company: {code, name, description}
 * }
*/
router.get("/:id", async function (req, res) {
  const invoiceResult = await db.query(
    `SELECT id, amt, paid, add_date, paid_date, comp_code AS company
      FROM invoices
        WHERE id = $1`,[req.params.id]
  );
  const invoice = invoiceResult.rows[0];

  if (!invoice) {
    throw new NotFoundError("Invoice code not found");
  }

  const companyResult = await db.query(
    `SELECT code, name, description
      FROM companies
        WHERE code = $1`, [invoice.company]
  );
  const company = companyResult.rows[0];

  invoice.company = company

  return res.json({invoice});
})

/** Add an invoice
 * Needs to be given JSON like: {comp_code, amt}
 * returns JSON like: {invoice: {id, comp_code, amt, paid, add_date, paid_date}}
*/
router.post("/", async function (req, res) {
  if (!req.body) throw new BadRequestError("Invalid parameters");

  const { comp_code, amt } = req.body;
  const result = await db.query(
    `INSERT INTO invoices (comp_code, amt)
           VALUES ($1, $2)
           RETURNING id, comp_code, amt, paid, add_date, paid_date`,
    [comp_code, amt]
  );
  const invoice = result.rows[0];

  return res.status(201).json({ invoice });
})

module.exports = router;