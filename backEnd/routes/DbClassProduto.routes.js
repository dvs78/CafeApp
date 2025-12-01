// backEnd/routes/DbClassProduto.routes.js
import DbClass from "./DbClass.routes.js";

class DbClassProduto extends DbClass {
  tabela = "produtos";
  idCol = "id";
  cols = ["id", "nome", "ativo"];

  sanitize(payload) {
    const out = {};
    if (payload.nome !== undefined) out.nome = payload.nome;
    if (payload.ativo !== undefined) out.ativo = !!payload.ativo;
    return out;
  }

  async getAllAtivos() {
    return super.getAll(this.tabela, this.cols, "nome ASC");
  }
}

export default DbClassProduto;
