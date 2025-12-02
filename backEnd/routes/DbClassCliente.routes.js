// backEnd/routes/DbClassCliente.routes.js
import DbClass from "./DbClass.routes.js";

class DbClassCliente extends DbClass {
  tabela = "clientes";
  idCol = "id";
  cols = ["id", "cliente"];

  sanitize(payload) {
    const out = {};

    if (payload.cliente !== undefined) {
      out.cliente = payload.cliente.trim();
    }

    return out;
  }
}

export default DbClassCliente;
