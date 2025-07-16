import pool from "../db";
import createError from "http-errors";
import * as interfaces from "../validation/interfaces";

// check if user exists in database

// check if user already has sellerId

//Create the corresponding ID

//return the ID

export async function retrieveSellerDetails(seller_id: number) {
  const result = await pool.query(
    `
          SELECT * 
          FROM buyers 
          WHERE s_id = $1`,
    [seller_id]
  );

  if (result.rowCount == 0) {
    throw createError(400, "Seller does not exist");
  }

  const { s_id, s_name, s_address, s_phone_no, s_email, s_tax } =
    result.rows[0];

  return {
    id: s_id,
    name: s_name,
    address: s_address,
    phoneNumber: s_phone_no,
    email: s_email,
    tax: s_tax,
  };
}

export async function findSellerIdForUser(userId: number): Promise<boolean> {
  const result = await pool.query(`SELECT s_id FROM users WHERE id = $1`, [
    userId,
  ]);

  if (result.rows.length === 0) {
    throw createError(400, "User not found");
  }

  if (result.rows[0].s_id === null) {
    throw createError(400, "Seller Id not found for user");
  }

  return true;
}

export async function createSeller(
  sellerInfo: interfaces.SellerDetails,
  user_id: number
): Promise<number> {
  const {
    // change and organise into objects
    sellerCompanyName,
    sellerAddress,
    sellerPhoneNumber,
    sellerTax,
    sellerEmail,
  } = sellerInfo;

  const insertSellerQuery = `
        INSERT INTO sellers (s_name, s_address, s_phone_no, s_email, s_tax)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (s_name, s_address, s_phone_no, s_email, s_tax) DO NOTHING
        RETURNING s_id;
    `;

  const sellerValues = [
    sellerCompanyName,
    sellerAddress,
    sellerPhoneNumber,
    sellerEmail,
    sellerTax,
  ];

  const result = await pool.query(insertSellerQuery, sellerValues);

  if (!result.rows[0]?.s_id) {
    throw createError(400, "Failed to create seller - no ID returned");
  }

  const s_id = result.rows[0].s_id;

  // Update user table to link buyer id
  const updateUserQuery = `
        UPDATE users
        SET s_id =$1
        WHERE id = $2
    `;
  await pool.query(updateUserQuery, [s_id, user_id]);
  return s_id;
}
