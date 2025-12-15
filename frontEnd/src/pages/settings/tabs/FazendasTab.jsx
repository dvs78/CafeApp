import { useEffect, useState } from "react";
import api from "../../../services/api";
import { notificar } from "../../../components/Toast";
import FormFazenda from "../components/FormFazenda";

function FazendasTab() {
  const [clientes, setClientes] = useState([]);
  const [clienteId, setClienteId] = useState("");
  const [fazendas, setFazendas] = useState([]);

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

  async function carregarFazendas(cid) {
    if (!cid) return setFazendas([]);
    try {
      const { data } = await api.get(`/fazendas`, {
        params: { cliente_id: cid },
      });
      setFazendas(data || []);
    } catch {
      notificar("erro", "Erro ao carregar fazendas.");
    }
  }

  useEffect(() => {
    carregarClientes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    carregarFazendas(clienteId);
  }, [clienteId]);

  async function excluir(id) {
    if (!window.confirm("Deseja excluir esta fazenda?")) return;

    try {
      await api.delete(`/fazendas/${id}`);
      setFazendas((prev) => prev.filter((f) => f.id !== id));
      notificar("sucesso", "Fazenda removida.");
    } catch {
      notificar("erro", "Erro ao excluir fazenda.");
    }
  }

  return (
    <>
      <div className="settings-header">
        <h2>Fazendas</h2>

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
            Nova Fazenda
          </button>
        </div>
      </div>

      <table className="settings-table">
        <thead>
          <tr>
            <th>Fazenda</th>
            <th width="160">Ações</th>
          </tr>
        </thead>
        <tbody>
          {fazendas.map((f) => (
            <tr key={f.id}>
              <td>{f.fazenda}</td>
              <td className="acoes">
                <button type="button" onClick={() => setEditar(f)}>
                  Editar
                </button>
                <button
                  type="button"
                  className="danger"
                  onClick={() => excluir(f.id)}
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}

          {fazendas.length === 0 && (
            <tr>
              <td colSpan={2}>Nenhuma fazenda cadastrada para este cliente.</td>
            </tr>
          )}
        </tbody>
      </table>

      {(abrirForm || editar) && (
        <FormFazenda
          clienteId={clienteId}
          fazenda={editar}
          onClose={() => {
            setAbrirForm(false);
            setEditar(null);
          }}
          onSaved={() => carregarFazendas(clienteId)}
        />
      )}
    </>
  );
}

export default FazendasTab;
