import dotenv from "dotenv";
import pool from "./config-db.js";

dotenv.config();

const seed = async () => {
  try {
    await pool.query(`
      INSERT INTO products(name, category, price)
      SELECT
        'product ' || gs,
        (ARRAY[
          'Beauty',
          'Furniture',
          'Electronics',
          'Jewellery',
          'Watches',
          'Appliances',
          'Baby',
          'Computers'
        ])[1 + floor(random() * 8)],
        (random() * 1000)::int + 1
      FROM generate_series(1, 200000) gs;
    `);

    console.log("Seeding complete");
    process.exit(0);

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();