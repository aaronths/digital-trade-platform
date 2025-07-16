import pool from "../db";
import createError from "http-errors";
import * as interfaces from "../validation/interfaces";

export async function findBuyerIdForUser(userId: number): Promise<boolean> {
  const result = await pool.query(`SELECT b_id FROM users WHERE id = $1`, [
    userId,
  ]);

  if (result.rows.length === 0) {
    throw createError(400, "User not found");
  }

  if (result.rows[0].b_id === null) {
    throw createError(400, "buyer Id not found for user");
  }

  return true;
}

// check if user exists in database
export async function createBuyer(
  buyerInfo: interfaces.BuyerDetails,
  user_id: number
): Promise<number> {
  const {
    // change and organise into objects
    buyerCompanyName,
    buyerAddress,
    buyerPhoneNumber,
    buyerTax,
    buyerEmail,
  } = buyerInfo;

  const insertBuyerQuery = `
        INSERT INTO buyers (b_name, b_address, b_phone_no, b_email, b_tax)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (b_name, b_address, b_phone_no, b_email, b_tax) DO NOTHING
        RETURNING b_id;
    `;

  const buyerValues = [
    buyerCompanyName,
    buyerAddress,
    buyerPhoneNumber,
    buyerEmail,
    buyerTax,
  ];

  const result = await pool.query(insertBuyerQuery, buyerValues);

  if (!result.rows[0]?.b_id) {
    throw createError(400, "Failed to create buyer - no ID returned");
  }

  const b_id = result.rows[0].b_id;

  // Update user table to link buyer id
  const updateUserQuery = `
        UPDATE users
        SET b_id =$1
        WHERE id = $2
    `;
  await pool.query(updateUserQuery, [b_id, user_id]);
  return b_id;
}

export async function retrieveBuyerDetails(buyer_id: number) {
  const result = await pool.query(
    `
          SELECT * 
          FROM buyers 
          WHERE b_id = $1`,
    [buyer_id]
  );

  if (result.rowCount == 0) {
    throw createError(400, "Buyer does not exist");
  }

  const { b_id, b_name, b_address, b_phone_no, b_email, b_tax } =
    result.rows[0];

  return {
    id: b_id,
    name: b_name,
    address: b_address,
    phoneNumber: b_phone_no,
    email: b_email,
    tax: b_tax,
  };
}
