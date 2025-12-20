// src/pages/settings/components/FormServico.jsx
import { useEffect, useState } from "react";
import api from "../../../services/api";
import { notificar } from "../../../components/Toast";
import FormModal from "./FormModal";

function FormServico({ servico, onClose, onSaved }) {
  const editando = Boolean(servico?.id);

  const [nome, setNome] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (editando) {
      setNome(servico?.nome || "");
    } else {
      setNome("");
    }
  }, [editando, servico]);

  async function salvar() {
    const nomeLimpo = (nome || "").trim();
    if (!nomeLimpo) return notificar("erro", "Informe o nome do serviço.");

    setSalvando(true);
    try {
      if (editando) {
        await api.put(`/servicos-lista/${servico.id}`, { nome: nomeLimpo });
        notificar("sucesso", "Serviço atualizado.");
      } else {
        await api.post("/servicos-lista", { nome: nomeLimpo });
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
    <FormModal
      title={editando ? "Editar Serviço" : "Novo Serviço"}
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            className="btn-primary"
            onClick={salvar}
            disabled={salvando}
          >
            {salvando ? "Salvando..." : "Salvar"}
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            disabled={salvando}
          >
            Cancelar
          </button>
        </>
      }
    >
      <div className="form-grid">
        <div className="form-field">
          <label>Serviço</label>
          <input
            className="form-control"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex.: Adubação química"
            autoFocus
          />
        </div>
      </div>
    </FormModal>
  );
}

export default FormServico;
