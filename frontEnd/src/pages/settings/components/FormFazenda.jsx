import { useEffect, useState } from "react";
import api from "../../../services/api";
import { notificar } from "../../../components/Toast";

function FormFazenda({ clienteId, fazenda, onClose, onSaved }) {
  const editando = Boolean(fazenda?.id);
  const [nome, setNome] = useState("");

  useEffect(() => {
    setNome(fazenda?.fazenda || "");
  }, [fazenda]);

  async function salvar(e) {
    e.preventDefault();

    if (!nome.trim()) {
      notificar("erro", "Informe o nome da fazenda.");
      return;
    }

    try {
      if (editando) {
        await api.put(`/fazendas/${fazenda.id}`, { fazenda: nome });
        notificar("sucesso", "Fazenda atualizada.");
      } else {
        await api.post(`/fazendas`, { fazenda: nome, cliente_id: clienteId });
        notificar("sucesso", "Fazenda criada.");
      }

      onSaved?.();
      onClose?.();
    } catch {
      notificar("erro", "Erro ao salvar fazenda.");
    }
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-header">
          <h3>{editando ? "Editar Fazenda" : "Nova Fazenda"}</h3>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        <form onSubmit={salvar}>
          <div className="modal-body">
            <label>Fazenda</label>
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome da fazenda"
              autoFocus
            />
          </div>

          <div className="modal-footer">
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

export default FormFazenda;
