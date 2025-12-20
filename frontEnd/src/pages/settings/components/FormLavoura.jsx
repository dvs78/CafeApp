import { useEffect, useState } from "react";
import api from "../../../services/api";
import { notificar } from "../../../components/Toast";

import FormModal from "./FormModal";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";

function FormLavoura({ clienteId, lavoura, onClose, onSaved }) {
  const editando = Boolean(lavoura?.id);

  const [nome, setNome] = useState("");
  const [fazendaId, setFazendaId] = useState("");
  const [fazendas, setFazendas] = useState([]);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (editando) {
      setNome(lavoura?.nome || "");
      setFazendaId(String(lavoura?.fazenda_id || ""));
    } else {
      setNome("");
      setFazendaId("");
    }
  }, [editando, lavoura]);

  useEffect(() => {
    async function carregarFazendas() {
      if (!clienteId) {
        setFazendas([]);
        setFazendaId("");
        return;
      }

      try {
        const { data } = await api.get("/fazendas", {
          params: { cliente_id: clienteId },
        });

        const lista = Array.isArray(data) ? data : [];
        setFazendas(lista);

        // Criando: se houver fazendas, pré-seleciona a primeira
        if (!editando) setFazendaId(lista?.[0]?.id ? String(lista[0].id) : "");
      } catch {
        setFazendas([]);
        setFazendaId("");
        notificar("erro", "Erro ao carregar fazendas do cliente.");
      }
    }

    carregarFazendas();
  }, [clienteId, editando]);

  async function salvar() {
    const nomeLimpo = (nome || "").trim();

    if (!clienteId) return notificar("erro", "Selecione um cliente.");
    if (!fazendaId) return notificar("erro", "Selecione uma fazenda.");
    if (!nomeLimpo) return notificar("erro", "Informe o nome da lavoura.");

    setSalvando(true);
    try {
      if (editando) {
        await api.put(`/lavouras/${lavoura.id}`, {
          nome: nomeLimpo,
          fazenda_id: fazendaId,
        });
        notificar("sucesso", "Lavoura atualizada.");
      } else {
        await api.post("/lavouras", {
          nome: nomeLimpo,
          cliente_id: clienteId,
          fazenda_id: fazendaId,
        });
        notificar("sucesso", "Lavoura criada.");
      }

      onSaved?.();
      onClose?.();
    } catch (err) {
      notificar("erro", err?.response?.data?.erro || "Erro ao salvar lavoura.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <FormModal
      title={editando ? "Editar Lavoura" : "Nova Lavoura"}
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

          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancelar
          </button>
        </>
      }
    >
      <div className="form-grid">
        <div className="form-field">
          <label>Fazenda</label>

          <div className="form-select-wrapper">
            <select
              className="form-control"
              value={fazendaId}
              onChange={(e) => setFazendaId(e.target.value)}
              disabled={!clienteId || fazendas.length === 0}
            >
              {!clienteId && <option value="">Selecione um cliente...</option>}

              {clienteId && fazendas.length === 0 && (
                <option value="">Nenhuma fazenda para este cliente</option>
              )}

              {clienteId && fazendas.length > 0 && (
                <>
                  <option value="">Selecione uma fazenda...</option>
                  {fazendas.map((f) => (
                    <option key={f.id} value={String(f.id)}>
                      {f.fazenda}
                    </option>
                  ))}
                </>
              )}
            </select>

            <FontAwesomeIcon icon={faChevronDown} className="select-icon" />
          </div>
        </div>

        <div className="form-field">
          <label>Nome</label>
          <input
            className="form-control"
            placeholder="Ex.: Canjica Arara"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>
      </div>
    </FormModal>
  );
}

export default FormLavoura;
