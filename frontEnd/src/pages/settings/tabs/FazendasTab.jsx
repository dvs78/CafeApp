import { useEffect, useMemo, useState } from "react";
import api from "../../../services/api";
import { notificar } from "../../../components/Toast";
import FormFazenda from "../components/FormFazenda";

import ConfirmDialog from "../../../components/ConfirmDialog/ConfirmDialog";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPen,
  faTrash,
  faSearch,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";

function FazendasTab() {
  const [clientes, setClientes] = useState([]);
  const [clienteId, setClienteId] = useState("");
  const [fazendas, setFazendas] = useState([]);

  const [abrirForm, setAbrirForm] = useState(false);
  const [editar, setEditar] = useState(null);

  // 🔎 busca
  const [busca, setBusca] = useState("");

  // -------------------------
  // CONFIRM DIALOG (EXCLUIR)
  // -------------------------
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [fazendaParaExcluir, setFazendaParaExcluir] = useState(null);

  async function carregarClientes() {
    try {
      const { data } = await api.get("/clientes");
      const lista = Array.isArray(data) ? data : [];
      setClientes(lista);

      if (!clienteId && lista.length) {
        setClienteId(lista[0].id);
      }
    } catch {
      notificar("erro", "Erro ao carregar clientes.");
      setClientes([]);
    }
  }

  async function carregarFazendas(cid) {
    if (!cid) {
      setFazendas([]);
      return;
    }

    try {
      const { data } = await api.get("/fazendas", {
        params: { cliente_id: cid },
      });
      setFazendas(Array.isArray(data) ? data : []);
    } catch {
      notificar("erro", "Erro ao carregar fazendas.");
      setFazendas([]);
    }
  }

  useEffect(() => {
    carregarClientes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    carregarFazendas(clienteId);
    setBusca("");
  }, [clienteId]);

  function abrirConfirmExcluir(fazenda) {
    setFazendaParaExcluir({ id: fazenda.id, fazenda: fazenda.fazenda });
    setConfirmOpen(true);
  }

  function fecharConfirmExcluir() {
    setConfirmOpen(false);
    setFazendaParaExcluir(null);
  }

  async function confirmarExcluir() {
    const id = fazendaParaExcluir?.id;
    if (!id) return;

    try {
      await api.delete(`/fazendas/${id}`);
      setFazendas((prev) => prev.filter((f) => f.id !== id));
      notificar("sucesso", "Fazenda removida.");
    } catch (err) {
      const msg = err?.response?.data?.erro || "Erro ao excluir fazenda.";
      notificar("erro", msg);
    } finally {
      fecharConfirmExcluir();
    }
  }

  const fazendasFiltradas = useMemo(() => {
    const txt = (busca || "").trim().toLowerCase();
    if (!txt) return fazendas;
    return (fazendas || []).filter((f) =>
      (f.fazenda || "").toLowerCase().includes(txt)
    );
  }, [fazendas, busca]);

  return (
    <>
      <div className="settings-header settings-header--stack">
        {/* Linha 1 — título */}
        <h2>Fazendas</h2>

        {/* Linha 2 — ações */}
        <div className="settings-header-actions settings-actions-wrap">
          {/* Select cliente */}
          <div className="select-wrapper" style={{ maxWidth: 360 }}>
            <select
              className="settings-select"
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
            >
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.cliente}
                </option>
              ))}
            </select>

            <FontAwesomeIcon icon={faChevronDown} className="select-icon" />
          </div>

          {/* Busca */}
          <div className="settings-search">
            <FontAwesomeIcon icon={faSearch} />
            <input
              placeholder="Buscar fazenda..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

          {/* Botão */}
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
          {fazendasFiltradas.map((f) => (
            <tr key={f.id}>
              <td>{f.fazenda}</td>

              <td className="acoes">
                <button
                  className="acao editar"
                  type="button"
                  title="Editar fazenda"
                  onClick={() => setEditar(f)}
                >
                  <FontAwesomeIcon icon={faPen} />
                </button>

                <button
                  className="acao danger"
                  type="button"
                  title="Excluir fazenda"
                  onClick={() => abrirConfirmExcluir(f)}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </td>
            </tr>
          ))}

          {fazendasFiltradas.length === 0 && (
            <tr className="empty-row">
              <td colSpan={2}>Nenhuma fazenda encontrada.</td>
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

      <ConfirmDialog
        open={confirmOpen}
        title="Excluir fazenda"
        description={
          fazendaParaExcluir
            ? `Tem certeza que deseja excluir a fazenda "${fazendaParaExcluir.fazenda}"?\nEsta ação não pode ser desfeita.`
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

export default FazendasTab;
