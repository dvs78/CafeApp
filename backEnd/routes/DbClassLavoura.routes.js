// backEnd/routes/DbClassLavoura.routes.js
import DbClass from "./DbClass.routes.js";

class DbClassLavoura extends DbClass {
  tabela = "lavouras";
  idCol = "id";
  cols = ["id", "nome", "cliente_id", "ativo"];

  sanitize(payload) {
    const out = {};
    if (payload.nome !== undefined) out.nome = payload.nome;
    if (payload.cliente_id !== undefined) out.cliente_id = payload.cliente_id;
    if (payload.ativo !== undefined) out.ativo = !!payload.ativo;
    return out;
  }

  async getByCliente(clienteId) {
    const sql = `
      SELECT ${this.cols.join(", ")}
      FROM ${this.tabela}
      WHERE cliente_id = $1 AND ativo = true
      ORDER BY nome ASC
    `;
    const { rows } = await this.pool.query(sql, [clienteId]);
    return rows;
  }
}

export default DbClassLavoura;
