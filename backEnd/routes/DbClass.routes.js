// backEnd/routes/DbClass.routes.js
import pool from "./connect.routes.js";

class DbClass {
  // SELECT * FROM tabela (com colunas explícitas)
  async getAll(tabela, colunas, orderBy = "") {
    const cols = colunas.join(", ");
    const sql = `SELECT ${cols} FROM ${tabela}${
      orderBy ? ` ORDER BY ${orderBy}` : ""
    }`;
    const { rows } = await pool.query(sql);
    return rows;
  }

  // SELECT ... WHERE idCol = $1
  async getById(tabela, colunas, idCol, id) {
    const cols = colunas.join(", ");
    const sql = `SELECT ${cols} FROM ${tabela} WHERE ${idCol} = $1`;
    const { rows } = await pool.query(sql, [id]);
    return rows[0] || null;
  }

  // INSERT genérico
  async insert(tabela, dados) {
    const cols = Object.keys(dados);
    const vals = Object.values(dados);
    const placeholders = cols.map((_, i) => `$${i + 1}`).join(", ");

    const sql = `
      INSERT INTO ${tabela} (${cols.join(", ")})
      VALUES (${placeholders})
      RETURNING *;
    `;
    const { rows } = await pool.query(sql, vals);
    return rows[0];
  }

  // UPDATE genérico
  async update(tabela, idCol, id, dados) {
    const cols = Object.keys(dados);
    const vals = Object.values(dados);
    if (cols.length === 0) return null; // nada pra atualizar

    const sets = cols.map((c, i) => `${c} = $${i + 1}`).join(", ");
    const sql = `
      UPDATE ${tabela}
      SET ${sets}
      WHERE ${idCol} = $${cols.length + 1}
      RETURNING *;
    `;
    const { rows } = await pool.query(sql, [...vals, id]);
    return rows[0] || null;
  }

  // DELETE genérico
  async remove(tabela, idCol, id) {
    const sql = `DELETE FROM ${tabela} WHERE ${idCol} = $1 RETURNING *;`;
    const { rows } = await pool.query(sql, [id]);
    return rows[0] || null;
  }
}

export default DbClass;
