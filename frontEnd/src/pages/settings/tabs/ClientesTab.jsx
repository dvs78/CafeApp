import { useEffect, useState } from "react";
import api from "../../../services/api";
import FormCliente from "../components/FormCliente";
import { notificar } from "../../../components/Toast";
import ConfirmDialog from "../../../components/ConfirmDialog/ConfirmDialog";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash } from "@fortawesome/free-solid-svg-icons";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

function ClientesTab() {
  const [clientes, setClientes] = useState([]);
  const [abrirForm, setAbrirForm] = useState(false);
  const [editar, setEditar] = useState(null);
  const [busca, setBusca] = useState("");
  const clientesFiltrados = clientes.filter((c) =>
    c.cliente.toLowerCase().includes(busca.toLowerCase())
  );

  // -------------------------
  // CONFIRM DIALOG (EXCLUIR)
  // -------------------------
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [clienteParaExcluir, setClienteParaExcluir] = useState(null);

  async function carregar() {
    try {
      const { data } = await api.get("/clientes");
      setClientes(Array.isArray(data) ? data : []);
    } catch {
      notificar("erro", "Erro ao carregar clientes.");
      setClientes([]);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  function abrirConfirmExcluir(cliente) {
    setClienteParaExcluir({ id: cliente.id, cliente: cliente.cliente });
    setConfirmOpen(true);
  }

  function fecharConfirmExcluir() {
    setConfirmOpen(false);
    setClienteParaExcluir(null);
  }

  async function confirmarExcluir() {
    const id = clienteParaExcluir?.id;
    if (!id) return;

    try {
      await api.delete(`/clientes/${id}`);
      setClientes((prev) => prev.filter((c) => c.id !== id));
      notificar("sucesso", "Cliente removido.");
    } catch (err) {
      const msg = err?.response?.data?.erro || "Erro ao excluir cliente.";
      notificar("erro", msg);
    } finally {
      fecharConfirmExcluir();
    }
  }

  return (
    <>
      <div className="settings-header settings-header--stack">
        <h2>Clientes</h2>

        <div className="settings-header-actions">
          <div className="settings-search">
            <FontAwesomeIcon icon={faSearch} />
            <input
              placeholder="Buscar cliente..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

          <button
            className="btn-primary"
            type="button"
            onClick={() => setAbrirForm(true)}
          >
            Novo Cliente
          </button>
        </div>
      </div>

      <table className="settings-table">
        <thead>
          <tr>
            <th>Cliente</th>
            <th width="160">Ações</th>
          </tr>
        </thead>

        <tbody>
          {clientesFiltrados.map((c) => (
            <tr key={c.id}>
              <td>{c.cliente}</td>

              <td className="acoes">
                <button
                  type="button"
                  className="acao editar"
                  title="Editar cliente"
                  onClick={() => setEditar(c)}
                >
                  <FontAwesomeIcon icon={faPen} />
                </button>

                <button
                  type="button"
                  className="acao danger"
                  title="Excluir cliente"
                  onClick={() => abrirConfirmExcluir(c)}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </td>
            </tr>
          ))}

          {clientes.length === 0 && (
            <tr className="empty-row">
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

      <ConfirmDialog
        open={confirmOpen}
        title="Excluir cliente"
        description={
          clienteParaExcluir
            ? `Tem certeza que deseja excluir o cliente "${clienteParaExcluir.cliente}"?\nEsta ação não pode ser desfeita.`
            : ""
        }
        confirmLabel="Confirmar"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={confirmarExcluir}
        onCancel={fecharConfirmExcluir}
      />
    </>
  );
}

export default ClientesTab;
