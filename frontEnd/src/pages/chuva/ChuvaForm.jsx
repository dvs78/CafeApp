import "./Chuva.css";
import { useEffect, useState } from "react";
import api from "../../services/api";
import { notificar } from "../../components/Toast";
import { useAuth } from "../../context/AuthContext";

function ChuvaForm({ editando, onSaved, onCancelar }) {
  const { workspace } = useAuth();

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

  // ------------------------------
  // CARREGAR PLUVIÔMETROS
  // ------------------------------
  useEffect(() => {
    async function carregarPluviometros() {
      if (!clienteId || !fazendaId) return;

      try {
        const { data } = await api.get(`/pluviometros/${clienteId}`);
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
  }, [clienteId, fazendaId]);

  // ------------------------------
  // PREENCHER QUANDO EDITANDO
  // ------------------------------
  useEffect(() => {
    if (!editando) return;

    setData(editando.data ? editando.data.split("T")[0] : "");
    setChuva(
      editando.chuva !== null && editando.chuva !== undefined
        ? String(editando.chuva)
        : ""
    );
    setPluviometroId(editando.pluviometro_id || "");
  }, [editando]);

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
      safra_id: safraId, // ✅ AQUI
      pluviometro_id: pluviometroId,
    };

    const req = editando
      ? api.put(`/chuvas/${editando.id}`, payload)
      : api.post("/chuvas", payload);

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
    <section className="chuva-card-form anima-card">
      <div className="chuva-topo">
        <h2 className="chuva-title">
          {editando ? "Editar chuva" : "Lançar chuva"}
        </h2>

        <button
          type="button"
          className="btn-limpar-filtros"
          onClick={onCancelar}
        >
          Fechar
        </button>
      </div>

      <form onSubmit={salvar} className="chuva-form">
        <div className="chuva-form-row">
          <div className="login-campo">
            <label className="login-label">Data</label>
            <input
              className="login-input"
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
            />
          </div>

          <div className="login-campo">
            <label className="login-label">Pluviômetro</label>
            <select
              className="login-input"
              value={pluviometroId}
              onChange={(e) => setPluviometroId(e.target.value)}
            >
              <option value="">Selecione</option>
              {pluviometros.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="chuva-form-row">
          <div className="login-campo">
            <label className="login-label">Chuva (mm)</label>
            <input
              className="login-input"
              type="number"
              step="0.1"
              min="0"
              value={chuva}
              onChange={(e) => setChuva(e.target.value)}
            />
          </div>

          <div className="login-campo" />
        </div>

        <div className="chuva-actions">
          <button className="btn-primario" type="submit">
            Salvar
          </button>

          <button
            type="button"
            className="btn-limpar-filtros"
            onClick={onCancelar}
          >
            Cancelar
          </button>
        </div>
      </form>
    </section>
  );
}

export default ChuvaForm;
