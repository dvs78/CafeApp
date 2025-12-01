import pg from "pg";
import "dotenv/config";

const pool = new pg.Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

// opcional: teste rápido (rode este arquivo diretamente para testar)
if (import.meta.url === `file://${process.argv[1]}`) {
  const r = await pool.query("SELECT NOW()");
  console.log(r.rows[0]);
}

export default pool;
