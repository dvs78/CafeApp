// import pg from "pg";
// import "dotenv/config";

// const pool = new pg.Pool({
//   host: process.env.DB_HOST,
//   port: process.env.DB_PORT,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_DATABASE,
// });

// export default pool;

import pg from "pg";
import "dotenv/config";

const isProduction = process.env.NODE_ENV === "production";

const pool = new pg.Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  // Na Render o Postgres exige SSL; localmente não.
  ssl: isProduction ? { rejectUnauthorized: false } : undefined,
});

// opcional: teste rápido (rode este arquivo diretamente para testar)
if (import.meta.url === `file://${process.argv[1]}`) {
  const teste = async () => {
    try {
      const r = await pool.query("SELECT NOW()");
      console.log("Conexão OK:", r.rows[0]);
    } catch (err) {
      console.error("Erro na conexão:", err);
    } finally {
      pool.end();
    }
  };
  teste();
}

export default pool;
