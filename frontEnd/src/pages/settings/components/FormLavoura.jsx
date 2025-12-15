import { useEffect, useState } from "react";
import api from "../../../services/api";
import { notificar } from "../../../components/Toast";

function FormLavoura({ clienteId, lavoura, onClose, onSaved }) {
  const editando = !!lavoura?.id;

  const [nome, setNome] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (editando) setNome(lavoura.nome || "");
    else setNome("");
  }, [editando, lavoura]);

  function validar() {
    if (!clienteId) return "Selecione um cliente.";
    if (!nome.trim()) return "Informe o nome da lavoura.";
    return null;
  }

  async function salvar() {
    const erro = validar();
    if (erro) return notificar("erro", erro);

    setSalvando(true);
    try {
      const payload = { nome: nome.trim(), cliente_id: clienteId };

      if (editando) {
        await api.put(`/lavouras/${lavoura.id}`, { nome: payload.nome });
        notificar("sucesso", "Lavoura atualizada.");
      } else {
        await api.post("/lavouras", payload);
        notificar("sucesso", "Lavoura criada.");
      }

      onSaved?.();
      onClose?.();
    } catch (err) {
      const msg = err?.response?.data?.erro || "Erro ao salvar lavoura.";
      notificar("erro", msg);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <h3>{editando ? "Editar Lavoura" : "Nova Lavoura"}</h3>
          <button type="button" className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <label>Nome</label>
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

export default FormLavoura;
