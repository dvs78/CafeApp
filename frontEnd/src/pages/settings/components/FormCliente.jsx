import { useEffect, useState } from "react";
import api from "../../../services/api";
import { notificar } from "../../../components/Toast";
import FormModal from "./FormModal";

function FormCliente({ cliente, onClose, onSave, onSaved }) {
  const editando = Boolean(cliente?.id);

  const [nome, setNome] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (editando) {
      setNome(cliente?.cliente || "");
    } else {
      setNome("");
    }
  }, [editando, cliente]);

  async function salvar() {
    const nomeLimpo = (nome || "").trim();

    if (!nomeLimpo) {
      return notificar("erro", "Informe o nome do cliente.");
    }

    setSalvando(true);
    try {
      let resp;

      if (editando) {
        resp = await api.put(`/clientes/${cliente.id}`, {
          cliente: nomeLimpo,
        });
        notificar("sucesso", "Cliente atualizado.");
      } else {
        resp = await api.post(`/clientes`, { cliente: nomeLimpo });
        notificar("sucesso", "Cliente criado.");
      }

      // mantém compatibilidade com quem usa onSave e com quem usa onSaved
      onSave?.(resp?.data);
      onSaved?.(resp?.data);

      onClose?.();
    } catch (err) {
      notificar("erro", err?.response?.data?.erro || "Erro ao salvar cliente.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <FormModal
      title={editando ? "Editar Cliente" : "Novo Cliente"}
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
          <label>Nome do cliente</label>
          <input
            className="form-control"
            placeholder="Ex.: Agrocoffee"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            autoFocus
          />
        </div>
      </div>
    </FormModal>
  );
}

export default FormCliente;
