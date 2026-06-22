import pool from './config-db.js';

export const get_items = async (req, res) => {
  try {
    const limit = Math.min(Number.parseInt(req.query.limit, 10) || 50, 50);
    const snapshot = req.query.snapshot || new Date().toISOString();
    const cursor = req.query.cursor ? JSON.parse(req.query.cursor) : null;

    
    let sql = `
      SELECT id, name, category, price, created_at::text AS created_at, updated_at 
      FROM products 
      WHERE 1=1
    `;
    const values = [];

    if (req.query.category) {
      values.push(req.query.category.split(',').map(c => c.trim()).filter(Boolean));
      sql += ` AND category = ANY($${values.length})`;
    }
    if (req.query.minPrice) {
      values.push(Number.parseInt(req.query.minPrice, 10));
      sql += ` AND price >= $${values.length}`;
    }
    if (req.query.maxPrice) {
      values.push(Number.parseInt(req.query.maxPrice, 10));
      sql += ` AND price <= $${values.length}`;
    }

    if (!cursor) {
      values.push(snapshot);
      sql += ` AND created_at <= $${values.length}::timestamptz`;
    } else {
      values.push(cursor.created_at, cursor.id);
      sql += ` AND (created_at, id) < ($${values.length - 1}::timestamptz, $${values.length}::integer)`;
    }

   
    values.push(limit + 1);
    sql += ` ORDER BY created_at DESC, id DESC LIMIT $${values.length}`;

    const { rows } = await pool.query(sql, values);

    const hasMore = rows.length > limit;
    if (hasMore) rows.pop();

    const nextCursor = hasMore 
      ? { created_at: rows[rows.length - 1].created_at, id: rows[rows.length - 1].id } 
      : null;

    return res.json({ data: rows, nextCursor, snapshot });

  } catch (err) {
    console.error("get_items error:", err);
    return res.status(500).json({ error: "internal server error" });
  }
};