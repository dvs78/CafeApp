import { useEffect, useState } from "react";
import api from "../../../services/api";
import { notificar } from "../../../components/Toast";
import FormLavoura from "../components/FormLavoura";

function LavourasTab() {
  const [clientes, setClientes] = useState([]);
  const [clienteId, setClienteId] = useState("");
  const [lavouras, setLavouras] = useState([]);

  const [abrirForm, setAbrirForm] = useState(false);
  const [editar, setEditar] = useState(null);

  async function carregarClientes() {
    try {
      const { data } = await api.get("/clientes");
      setClientes(data || []);
      if (!clienteId && data?.length) setClienteId(data[0].id);
    } catch {
      notificar("erro", "Erro ao carregar clientes.");
    }
  }

  async function carregarLavouras(cid) {
    if (!cid) return setLavouras([]);
    try {
      const { data } = await api.get(`/lavouras/${cid}`);
      setLavouras(data || []);
    } catch {
      notificar("erro", "Erro ao carregar lavouras.");
    }
  }

  useEffect(() => {
    carregarClientes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    carregarLavouras(clienteId);
  }, [clienteId]);

  async function excluir(id) {
    if (!window.confirm("Deseja excluir esta lavoura?")) return;

    try {
      await api.delete(`/lavouras/${id}`);
      setLavouras((prev) => prev.filter((l) => l.id !== id));
      notificar("sucesso", "Lavoura removida.");
    } catch (err) {
      const msg = err?.response?.data?.erro || "Erro ao excluir lavoura.";
      notificar("erro", msg);
    }
  }

  return (
    <>
      <div className="settings-header">
        <h2>Lavouras</h2>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <select
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
          >
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.cliente}
              </option>
            ))}
          </select>

          <button
            className="btn-primary"
            type="button"
            onClick={() => setAbrirForm(true)}
            disabled={!clienteId}
          >
            Nova Lavoura
          </button>
        </div>
      </div>

      <table className="settings-table">
        <thead>
          <tr>
            <th>Lavoura</th>
            <th width="160">Ações</th>
          </tr>
        </thead>
        <tbody>
          {lavouras.map((l) => (
            <tr key={l.id}>
              <td>{l.nome}</td>
              <td className="acoes">
                <button type="button" onClick={() => setEditar(l)}>
                  Editar
                </button>
                <button
                  type="button"
                  className="danger"
                  onClick={() => excluir(l.id)}
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}

          {lavouras.length === 0 && (
            <tr>
              <td colSpan={2}>Nenhuma lavoura cadastrada para este cliente.</td>
            </tr>
          )}
        </tbody>
      </table>

      {(abrirForm || editar) && (
        <FormLavoura
          clienteId={clienteId}
          lavoura={editar}
          onClose={() => {
            setAbrirForm(false);
            setEditar(null);
          }}
          onSaved={() => carregarLavouras(clienteId)}
        />
      )}
    </>
  );
}

export default LavourasTab;
