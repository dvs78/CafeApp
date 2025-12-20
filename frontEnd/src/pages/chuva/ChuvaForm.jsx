import "./Chuva.css";
import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import { notificar } from "../../components/Toast";
import { useAuth } from "../../context/AuthContext";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faChevronDown } from "@fortawesome/free-solid-svg-icons";

function ChuvaForm({ editando, onSaved, onCancelar }) {
  const { token, workspace } = useAuth();

  // ------------------------------
  // CONTEXTO
  // ------------------------------
  const clienteId =
    workspace?.clienteId || localStorage.getItem("ctx_cliente_id") || "";

  const fazendaId =
    workspace?.fazendaId || localStorage.getItem("ctx_fazenda_id") || "";

  const safraId =
    workspace?.safraId || localStorage.getItem("ctx_safra_id") || "";

  // ------------------------------
  // STATE
  // ------------------------------
  const [data, setData] = useState("");
  const [chuva, setChuva] = useState("");
  const [pluviometroId, setPluviometroId] = useState("");
  const [pluviometros, setPluviometros] = useState([]);

  const titulo = editando ? "Editar chuva" : "Lançar chuva";

  // ------------------------------
  // CARREGAR PLUVIÔMETROS
  // ------------------------------
  useEffect(() => {
    async function carregarPluviometros() {
      if (!clienteId || !fazendaId) return;

      try {
        const { data } = await api.get(`/pluviometros/${clienteId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        const lista = Array.isArray(data) ? data : [];

        const filtrados = lista.filter(
          (p) => String(p.fazenda_id) === String(fazendaId)
        );

        setPluviometros(filtrados);

        // garante que o id selecionado ainda exista
        setPluviometroId((prev) =>
          filtrados.some((p) => String(p.id) === String(prev)) ? prev : ""
        );
      } catch {
        notificar("erro", "Erro ao carregar pluviômetros.");
        setPluviometros([]);
        setPluviometroId("");
      }
    }

    carregarPluviometros();
  }, [clienteId, fazendaId, token]);

  const opcoesPluviometro = useMemo(() => {
    return (Array.isArray(pluviometros) ? pluviometros : [])
      .map((p) => ({
        id: p?.id,
        nome: p?.nome ?? "",
      }))
      .filter((x) => x.id && x.nome);
  }, [pluviometros]);

  // ------------------------------
  // PREENCHER QUANDO EDITANDO
  // ------------------------------
  useEffect(() => {
    if (!editando) return;

    setData(editando.data ? String(editando.data).split("T")[0] : "");
    setChuva(
      editando.chuva !== null && editando.chuva !== undefined
        ? String(editando.chuva)
        : ""
    );
    setPluviometroId(editando.pluviometro_id || "");
  }, [editando]);

  // ------------------------------
  // LIMPAR
  // ------------------------------
  function limparFormulario() {
    setData("");
    setChuva("");
    setPluviometroId("");
  }

  // ------------------------------
  // SALVAR
  // ------------------------------
  function salvar(e) {
    e.preventDefault();

    if (!clienteId || !fazendaId || !safraId) {
      notificar(
        "erro",
        "Contexto inválido. Selecione Cliente, Fazenda e Safra novamente."
      );
      return;
    }

    if (!data || chuva === "" || !pluviometroId) {
      notificar("erro", "Preencha todos os campos.");
      return;
    }

    const chuvaNum = Number(chuva);
    if (Number.isNaN(chuvaNum) || chuvaNum < 0) {
      notificar("erro", "Chuva deve ser um número válido (mm).");
      return;
    }

    const payload = {
      data,
      chuva: chuvaNum,
      cliente_id: clienteId,
      fazenda_id: fazendaId,
      safra_id: safraId,
      pluviometro_id: pluviometroId,
    };

    const req = editando
      ? api.put(`/chuvas/${editando.id}`, payload, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })
      : api.post("/chuvas", payload, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

    req
      .then((res) => {
        notificar("sucesso", "Chuva salva.");
        onSaved(res.data);
      })
      .catch((err) => {
        notificar("erro", err?.response?.data?.erro || "Erro ao salvar chuva.");
      });
  }

  // ------------------------------
  // RENDER
  // ------------------------------
  return (
    <section className="card card-form anima-card">
      <div className="card-title-row">
        <h2>{titulo}</h2>

        <button
          type="button"
          className="btn-icon-close"
          onClick={onCancelar}
          aria-label="Fechar formulário"
          title="Fechar"
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>
      </div>

      <form onSubmit={salvar} className="form-grid">
        {/* Linha única: Data | Pluviômetro | Chuva (mm) */}
        <div className="chuva-form-row-3">
          <div className="form-field">
            <label>Data</label>
            <input
              className="form-control"
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label>Pluviômetro</label>
            <div className="form-select-wrapper">
              <select
                className="form-control"
                value={pluviometroId}
                onChange={(e) => setPluviometroId(e.target.value)}
              >
                <option value="">Selecione</option>
                {opcoesPluviometro.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
              </select>
              <FontAwesomeIcon icon={faChevronDown} className="select-icon" />
            </div>
          </div>

          <div className="form-field">
            <label>Chuva (mm)</label>
            <input
              className="form-control"
              type="number"
              step="0.1"
              min="0"
              value={chuva}
              onChange={(e) => setChuva(e.target.value)}
              placeholder="0"
            />
          </div>
        </div>

        <div className="form-actions">
          <button className="btn-primary" type="submit">
            {editando ? "Salvar alterações" : "Salvar"}
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={limparFormulario}
          >
            Limpar campos
          </button>

          <button type="button" className="btn-secondary" onClick={onCancelar}>
            Cancelar
          </button>
        </div>
      </form>
    </section>
  );
}

export default ChuvaForm;
