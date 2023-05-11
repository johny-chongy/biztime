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
      FROM invoices
      ORDER BY id`
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
    throw new NotFoundError("Invoice id not found");
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

  //test values if numbers in guard statement ~JSON schema :o
  try {
    const { comp_code, amt } = req.body;
    const result = await db.query(
      `INSERT INTO invoices (comp_code, amt)
             VALUES ($1, $2)
             RETURNING id, comp_code, amt, paid, add_date, paid_date`,
      [comp_code, amt]
    );
    const invoice = result.rows[0];

    return res.status(201).json({ invoice });
  } catch (err) {
    throw new BadRequestError("inputs require comp_code and amt")
  }

})

/** Update an invoice
 *  Needs to be given JSON like: {amt}
 *  return JSON like: {invoice: {id, comp_code, amt, paid, add_date, paid_date}}
 */
router.put("/:id", async function (req, res) {
  if (!req.body.amt) throw new BadRequestError("Invalid parameters");

  const { amt } = req.body;

  const result = await db.query(
    `UPDATE invoices
           SET amt = $1
           WHERE id = $2
           RETURNING id, comp_code, amt, paid, add_date`,
    [amt, req.params.id],
  );
  const invoice = result.rows[0];

  if (!invoice) {
    throw new NotFoundError("Invoice id not found");
  }

  return res.json({ invoice });
})

/** Delete an invoice
 *  Should return 404 if invoice cannot be found
 *  return JSON like: {status: "deleted"}
 */
router.delete("/:id", async function (req, res) {
  const result = await db.query(
    `DELETE FROM invoices WHERE id = $1
    RETURNING id`,
    [req.params.id]
  );

  const invoice = result.rows[0];

  if (!invoice) { // TODO: pattern match with other routes
    throw new NotFoundError("Invoice id not found");
  }

  return res.json({ status: "deleted" });
})

module.exports = router;