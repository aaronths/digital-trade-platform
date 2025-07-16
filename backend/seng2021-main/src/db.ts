import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

// Use environment variables for database connection
const pool = new Pool({
  user: process.env.DB_USER || "postgres", // DB_USER
  host:
    process.env.DB_HOST ||
    "notuna.cv68seqq07tw.ap-southeast-2.rds.amazonaws.com", // DB_HOST
  database: process.env.DB_NAME || "order_creation", // DB_NAME
  password: process.env.DB_PASSWORD || "postgresql", // DB_PASSWORD
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432, // DB_PORT
  ssl: {
    rejectUnauthorized: false, // Disable certificate verification (for testing only)
  },
});

export default pool;
