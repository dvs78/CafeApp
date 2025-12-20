import { useEffect, useState } from "react";
import api from "../../../services/api";
import { notificar } from "../../../components/Toast";
import FormModal from "./FormModal";

function FormSafra({ safra, onClose, onSaved }) {
  const editando = Boolean(safra?.id);

  const [nome, setNome] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (editando) {
      setNome(safra?.nome || "");
    } else {
      setNome("");
    }
  }, [editando, safra]);

  async function salvar() {
    const nomeLimpo = (nome || "").trim();

    if (!nomeLimpo) return notificar("erro", "Informe o nome da safra.");

    setSalvando(true);
    try {
      let resp;

      if (editando) {
        resp = await api.put(`/safras-lista/${safra.id}`, { nome: nomeLimpo });
        notificar("sucesso", "Safra atualizada.");
      } else {
        resp = await api.post("/safras-lista", { nome: nomeLimpo });
        notificar("sucesso", "Safra criada.");
      }

      onSaved?.(resp?.data);
      onClose?.();
    } catch (err) {
      notificar("erro", err?.response?.data?.erro || "Erro ao salvar safra.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <FormModal
      title={editando ? "Editar Safra" : "Nova Safra"}
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
          <label>Safra</label>
          <input
            className="form-control"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex.: Safra 25/26"
            autoFocus
          />
        </div>
      </div>
    </FormModal>
  );
}

export default FormSafra;
