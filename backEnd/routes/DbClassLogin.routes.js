// backEnd/routes/DbClassMudas.routes.js
import DbClass from "./DbClass.routes.js";

class DbClassLogin extends DbClass {
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
