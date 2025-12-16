// src/pages/settings/components/FormServico.jsx
import { useEffect, useState } from "react";
import api from "../../../services/api";
import { notificar } from "../../../components/Toast";

function FormServico({ servico, onClose, onSaved }) {
  const editando = Boolean(servico?.id);

  const [nome, setNome] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    setNome(servico?.nome || "");
  }, [servico]);

  function validar() {
    if (!nome.trim()) return "Informe o nome do serviço.";
    return null;
  }

  async function salvar(e) {
    e?.preventDefault?.();

    const erro = validar();
    if (erro) return notificar("erro", erro);

    setSalvando(true);
    try {
      const payload = { nome: nome.trim() };

      if (editando) {
        await api.put(`/servicos-lista/${servico.id}`, payload);
        notificar("sucesso", "Serviço atualizado.");
      } else {
        await api.post("/servicos-lista", payload);
        notificar("sucesso", "Serviço criado.");
      }

      onSaved?.();
      onClose?.();
    } catch (err) {
      const msg = err?.response?.data?.erro || "Erro ao salvar serviço.";
      notificar("erro", msg);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <h3>{editando ? "Editar Serviço" : "Novo Serviço"}</h3>

          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Fechar"
            disabled={salvando}
            title="Fechar"
          >
            ×
          </button>
        </div>

        <form onSubmit={salvar}>
          <div className="modal-body">
            <label>Serviço</label>
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex.: Adubação química"
              autoFocus
              disabled={salvando}
            />
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={salvando}
            >
              Cancelar
            </button>

            <button type="submit" className="btn-primary" disabled={salvando}>
              {salvando ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FormServico;
