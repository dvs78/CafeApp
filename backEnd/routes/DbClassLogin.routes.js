// backEnd/routes/DbClassMudas.routes.js
import DbClass from "./DbClass.routes.js";

class DbClassLogin extends DbClass {
  tabela = "mudas";
  idCol = "id";
  // Colunas que você usa/expõe
  cols = ["id", "ano", "semente", "embalagem", "cultivar", "producao"];

  // helper para aceitar só campos permitidos e normalizar tipos
  sanitize(payload) {
    const allowed = ["ano", "semente", "embalagem", "cultivar", "producao"];
    const out = {};
    for (const k of allowed) {
      if (payload[k] !== undefined && payload[k] !== null) out[k] = payload[k];
    }
    // normalizações básicas (ajuste se preferir)
    if (out.ano !== undefined) out.ano = Number(out.ano);
    if (out.producao !== undefined) out.producao = Number(out.producao);
    return out;
  }

  async getAll() {
    return super.getAll(this.tabela, this.cols, "id DESC");
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

export default DbClassLogin;
