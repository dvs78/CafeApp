// backEnd/routes/DbClassSafra.routes.js
import DbClass from "./DbClass.routes.js";

class DbClassSafraLista extends DbClass {
  tabela = "safras_lista";
  idCol = "id";
  cols = ["id", "nome", "ativo"];

  sanitize(payload) {
    const out = {};
    if (payload.nome !== undefined) out.nome = payload.nome;
    if (payload.ativo !== undefined) out.ativo = !!payload.ativo;
    return out;
  }

  async getAllAtivas() {
    return super.getAll(this.tabela, this.cols, "nome ASC");
  }
}

export default DbClassSafraLista;
