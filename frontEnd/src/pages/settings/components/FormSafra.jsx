import { useEffect, useState } from "react";
import api from "../../../services/api";
import { notificar } from "../../../components/Toast";

function FormSafra({ safra, onClose, onSaved }) {
  const editando = !!safra?.id;

  const [nome, setNome] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (editando) setNome(safra.nome || "");
    else setNome("");
  }, [editando, safra]);

  function validar() {
    if (!nome.trim()) return "Informe o nome da safra.";
    return null;
  }

  async function salvar() {
    const erro = validar();
    if (erro) return notificar("erro", erro);

    setSalvando(true);
    try {
      const payload = { nome: nome.trim() };

      if (editando) {
        await api.put(`/safras-lista/${safra.id}`, payload);
        notificar("sucesso", "Safra atualizada.");
      } else {
        await api.post("/safras-lista", payload);
        notificar("sucesso", "Safra criada.");
      }

      onSaved?.();
      onClose?.();
    } catch (err) {
      const msg = err?.response?.data?.erro || "Erro ao salvar safra.";
      notificar("erro", msg);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <h3>{editando ? "Editar Safra" : "Nova Safra"}</h3>
          <button type="button" className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <label>Safra</label>
          <input value={nome} onChange={(e) => setNome(e.target.value)} />
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancelar
          </button>
          <button
            type="button"
            onClick={salvar}
            className="btn-primary"
            disabled={salvando}
          >
            {salvando ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default FormSafra;
