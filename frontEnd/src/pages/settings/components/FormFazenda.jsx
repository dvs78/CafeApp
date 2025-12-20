import { useEffect, useState } from "react";
import api from "../../../services/api";
import { notificar } from "../../../components/Toast";
import FormModal from "./FormModal";

function FormFazenda({ clienteId, fazenda, onClose, onSaved }) {
  const editando = Boolean(fazenda?.id);

  const [nome, setNome] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (editando) {
      setNome(fazenda?.fazenda || "");
    } else {
      setNome("");
    }
  }, [editando, fazenda]);

  async function salvar() {
    const nomeLimpo = (nome || "").trim();

    if (!clienteId) return notificar("erro", "Selecione um cliente.");
    if (!nomeLimpo) return notificar("erro", "Informe o nome da fazenda.");

    setSalvando(true);
    try {
      if (editando) {
        await api.put(`/fazendas/${fazenda.id}`, { fazenda: nomeLimpo });
        notificar("sucesso", "Fazenda atualizada.");
      } else {
        await api.post(`/fazendas`, {
          fazenda: nomeLimpo,
          cliente_id: clienteId,
        });
        notificar("sucesso", "Fazenda criada.");
      }

      onSaved?.();
      onClose?.();
    } catch (err) {
      notificar("erro", err?.response?.data?.erro || "Erro ao salvar fazenda.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <FormModal
      title={editando ? "Editar Fazenda" : "Nova Fazenda"}
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
          <label>Fazenda</label>
          <input
            className="form-control"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome da fazenda"
            autoFocus
          />
        </div>
      </div>
    </FormModal>
  );
}

export default FormFazenda;
