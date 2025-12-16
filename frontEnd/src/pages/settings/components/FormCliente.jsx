import { useEffect, useState } from "react";
import api from "../../../services/api";
import { notificar } from "../../../components/Toast";

function FormCliente({ cliente, onClose, onSave }) {
  const editando = Boolean(cliente?.id);

  const [nome, setNome] = useState("");

  useEffect(() => {
    setNome(cliente?.cliente || "");
  }, [cliente]);

  async function salvar(e) {
    e.preventDefault();

    if (!nome.trim()) {
      notificar("erro", "Informe o nome do cliente.");
      return;
    }

    try {
      let resp;

      if (editando) {
        resp = await api.put(`/clientes/${cliente.id}`, {
          cliente: nome.trim(),
        });
        notificar("sucesso", "Cliente atualizado.");
      } else {
        resp = await api.post(`/clientes`, { cliente: nome.trim() });
        notificar("sucesso", "Cliente criado.");
      }

      onSave?.(resp?.data);
      onClose?.();
    } catch {
      notificar("erro", "Erro ao salvar cliente.");
    }
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-header">
          <h3>{editando ? "Editar Cliente" : "Novo Cliente"}</h3>

          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Fechar"
            title="Fechar"
          >
            ×
          </button>
        </div>

        {/* IMPORTANTE: footer está DENTRO do form */}
        <form onSubmit={salvar}>
          <div className="modal-body">
            <label>Nome do cliente</label>
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex.: Agrocoffee"
              autoFocus
            />
          </div>

          <div className="modal-footer">
            {/* GARANTIDO: submit */}
            <button type="submit" className="btn-primary">
              Salvar
            </button>

            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FormCliente;
