import { useEffect, useState } from "react";
import api from "../../../services/api";
import { notificar } from "../../../components/Toast";
import FormModal from "./FormModal";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";

function FormPluviometro({ clienteId, pluviometro, onClose, onSaved }) {
  const editando = Boolean(pluviometro?.id);

  const [nome, setNome] = useState("");
  const [fazendaId, setFazendaId] = useState("");
  const [fazendas, setFazendas] = useState([]);
  const [salvando, setSalvando] = useState(false);

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

        if (!editando) {
          setFazendaId(lista?.[0]?.id ? String(lista[0].id) : "");
        }
      } catch {
        notificar("erro", "Erro ao carregar fazendas do cliente.");
        setFazendas([]);
        setFazendaId("");
      }
    }

    carregarFazendas();
  }, [clienteId, editando]);

  useEffect(() => {
    if (editando) {
      setNome(pluviometro?.nome || "");
      setFazendaId(String(pluviometro?.fazenda_id || ""));
    } else {
      setNome("");
    }
  }, [editando, pluviometro]);

  async function salvar() {
    const nomeLimpo = (nome || "").trim();

    if (!clienteId) return notificar("erro", "Selecione um cliente.");
    if (!fazendaId) return notificar("erro", "Selecione uma fazenda.");
    if (!nomeLimpo) return notificar("erro", "Informe o nome do pluviômetro.");

    setSalvando(true);
    try {
      if (editando) {
        await api.put(`/pluviometros/${pluviometro.id}`, {
          nome: nomeLimpo,
          fazenda_id: fazendaId,
        });
        notificar("sucesso", "Pluviômetro atualizado.");
      } else {
        await api.post("/pluviometros", {
          nome: nomeLimpo,
          cliente_id: clienteId,
          fazenda_id: fazendaId,
        });
        notificar("sucesso", "Pluviômetro criado.");
      }

      onSaved?.();
      onClose?.();
    } catch (err) {
      notificar(
        "erro",
        err?.response?.data?.erro || "Erro ao salvar pluviômetro."
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <FormModal
      title={editando ? "Editar Pluviômetro" : "Novo Pluviômetro"}
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
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome do pluviômetro"
            autoFocus
          />
        </div>
      </div>
    </FormModal>
  );
}

export default FormPluviometro;
