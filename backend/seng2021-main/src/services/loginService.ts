import pool from "../db";
import createError from "http-errors";
import * as example from "./exampleService";
import bcrypt from "bcrypt";
import validator from "validator";
import { validPassword } from "../validation/formValidation";

// Register User
export const registerUser = async (
  nameFirst: string,
  nameLast: string,
  email: string,
  password: string
) => {
  try {
    example.checkValidEmail(email);
  } catch (err) {
    if (err instanceof Error) {
      throw createError(
        400,
        'Please use a valid email format (i.e. "valid@email.com")'
      );
    }
  }

  if (nameFirst.length < 2 || nameFirst.length > 20) {
    throw createError(400, "First name must be between 2-20 characters.");
  }

  if (nameLast.length < 2 || nameLast.length > 20) {
    throw createError(400, "Last name must be between 2-20 characters.");
  }

  for (const i of nameFirst) {
    if (!(validator.isAlpha(i) || i === "-" || i === " " || i === "'")) {
      throw createError(
        400,
        "First name can only contain letters, hyphens, spaces, and apostrophes."
      );
    }
  }

  for (const i of nameLast) {
    if (!(validator.isAlpha(i) || i === "-" || i === " " || i === "'")) {
      throw createError(
        400,
        "Last name can only contain letters, hyphens, spaces, and apostrophes."
      );
    }
  }

  if (!validPassword(password)) {
    throw createError(
      400,
      "Password must be 8 or more characters with at least one number and letter"
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await pool.query(
    `INSERT INTO users (namefirst, namelast, email, password) VALUES ($1, $2, $3, $4)`,
    [nameFirst, nameLast, email, hashedPassword]
  );
};

// Find User by Email
export const findUserByEmail = async (email: string) => {
  const res = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
  return res.rows[0];
};

// Find User by buyerId
export const findUserByBuyerId = async (buyerId: string) => {
  const res = await pool.query(`SELECT * FROM users WHERE b_id = $1`, [
    buyerId,
  ]);
  return res.rows[0];
};

// Find User by SellerId
export const findUserBySellerId = async (SellerId: string) => {
  const res = await pool.query(`SELECT * FROM users WHERE s_id = $1`, [
    SellerId,
  ]);
  return res.rows[0];
};
