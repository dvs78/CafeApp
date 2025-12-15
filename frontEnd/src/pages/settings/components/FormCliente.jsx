import { useEffect, useState } from "react";
import api from "../../../services/api";
import { notificar } from "../../../components/Toast";

function FormCliente({ cliente, onClose, onSave }) {
  const [nome, setNome] = useState("");

  useEffect(() => {
    if (cliente) {
      setNome(cliente.cliente);
    }
  }, [cliente]);

  async function salvar(e) {
    e.preventDefault();

    if (!nome.trim()) {
      notificar("erro", "Informe o nome do cliente.");
      return;
    }

    try {
      const payload = { cliente: nome };

      const { data } = cliente
        ? await api.put(`/clientes/${cliente.id}`, payload)
        : await api.post("/clientes", payload);

      onSave(data);
      notificar("sucesso", cliente ? "Cliente atualizado." : "Cliente criado.");
      onClose();
    } catch {
      notificar("erro", "Erro ao salvar cliente.");
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <h3>{cliente ? "Editar Cliente" : "Novo Cliente"}</h3>

        <form onSubmit={salvar}>
          <label>Nome do cliente</label>
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            autoFocus
          />

          <div className="modal-actions">
            <button type="button" onClick={onClose}>
              Cancelar
            </button>
            <button className="btn-primary" type="submit">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FormCliente;
