import { useEffect, useState } from "react";
import api from "../../../services/api";
import FormCliente from "../components/FormCliente";
import { notificar } from "../../../components/Toast";

function ClientesTab() {
  const [clientes, setClientes] = useState([]);
  const [abrirForm, setAbrirForm] = useState(false);
  const [editar, setEditar] = useState(null);

  async function carregar() {
    try {
      const { data } = await api.get("/clientes");
      setClientes(data || []);
    } catch {
      notificar("erro", "Erro ao carregar clientes.");
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function excluir(id) {
    if (!window.confirm("Deseja excluir este cliente?")) return;

    try {
      await api.delete(`/clientes/${id}`);
      setClientes((prev) => prev.filter((c) => c.id !== id));
      notificar("sucesso", "Cliente removido.");
    } catch {
      notificar("erro", "Erro ao excluir cliente.");
    }
  }

  return (
    <>
      <div className="settings-header">
        <h2>Clientes</h2>
        <button className="btn-primary" onClick={() => setAbrirForm(true)}>
          Novo Cliente
        </button>
      </div>

      <table className="settings-table">
        <thead>
          <tr>
            <th>Cliente</th>
            <th width="160">Ações</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((c) => (
            <tr key={c.id}>
              <td>{c.cliente}</td>
              <td className="acoes">
                <button onClick={() => setEditar(c)}>Editar</button>
                <button className="danger" onClick={() => excluir(c.id)}>
                  Excluir
                </button>
              </td>
            </tr>
          ))}

          {clientes.length === 0 && (
            <tr>
              <td colSpan={2}>Nenhum cliente cadastrado.</td>
            </tr>
          )}
        </tbody>
      </table>

      {(abrirForm || editar) && (
        <FormCliente
          cliente={editar}
          onClose={() => {
            setAbrirForm(false);
            setEditar(null);
          }}
          onSave={(novo) => {
            setClientes((prev) =>
              editar
                ? prev.map((c) => (c.id === novo.id ? novo : c))
                : [...prev, novo]
            );
          }}
        />
      )}
    </>
  );
}

export default ClientesTab;
