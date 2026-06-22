import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const test = async () => {
  const res = await pool.query("SELECT NOW()");
  console.log(res.rows);
  process.exit(0);
};

test();