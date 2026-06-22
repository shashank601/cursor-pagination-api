export const up = (pgm) => {
    pgm.sql(`
        CREATE INDEX idx_products_cursor 
        ON products(created_at DESC, id DESC);
    `);
};



export const down = (pgm) => {
    pgm.sql(`
        DROP INDEX IF EXISTS idx_products_cursor;
    `);
};