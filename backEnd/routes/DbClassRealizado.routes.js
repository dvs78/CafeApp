// backEnd/routes/DbClassRealizado.routes.js
import DbClass from "./DbClass.routes.js";

class DbClassRealizado extends DbClass {
  tabela = "realizado";
  idCol = "id";

  // Colunas usadas no sistema
  cols = [
    "id",
    "safra",
    "lavoura",
    "servico",
    "data",
    "status",
    "produto",
    "unidade",
    "quantidade",
    "usuario_id",
    "cliente_id",
    "criado_em",
  ];

  // Aceita só campos permitidos
  sanitize(payload) {
    const allowed = [
      "safra",
      "lavoura",
      "servico",
      "data",
      "status",
      "produto",
      "unidade",
      "quantidade",
      "usuario_id",
      "cliente_id",
    ];

    const out = {};
    for (const k of allowed) {
      if (payload[k] !== undefined && payload[k] !== null) {
        out[k] = payload[k];
      }
    }

    // normalizações
    if (out.quantidade !== undefined) {
      out.quantidade = Number(out.quantidade);
    }

    return out;
  }

  async getAll() {
    // se quiser ordenar do mais recente pro mais antigo:
    return super.getAll(this.tabela, this.cols, "data DESC, criado_em DESC");
  }

  async getById(id) {
    return super.getById(this.tabela, this.cols, this.idCol, id);
  }

  async create(payload) {
    const dados = this.sanitize(payload);
    return super.insert(this.tabela, dados);
  }

  async updateById(id, payload) {
    const dados = this.sanitize(payload);
    return super.update(this.tabela, this.idCol, id, dados);
  }

  async deleteById(id) {
    return super.remove(this.tabela, this.idCol, id);
  }
}

export default DbClassRealizado;
