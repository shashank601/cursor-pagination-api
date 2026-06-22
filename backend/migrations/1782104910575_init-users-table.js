export const up = (pgm) => {
    pgm.sql(`
        CREATE TABLE IF NOT EXISTS products (
            id SERIAL PRIMARY KEY, 
            name VARCHAR(255) NOT NULL,
            category VARCHAR(255) NOT NULL,
            price INT NOT NULL CHECK (price > 0),
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )


    `)

};


export const down = (pgm) => {
    pgm.sql(
        `DROP TABLE IF EXISTS products`
    )
};



