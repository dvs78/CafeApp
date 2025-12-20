import { useEffect, useMemo, useState } from "react";
import api from "../../../services/api";
import { notificar } from "../../../components/Toast";

import FormLavoura from "../components/FormLavoura";
import ConfirmDialog from "../../../components/ConfirmDialog/ConfirmDialog";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPen,
  faTrash,
  faSearch,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";

function LavourasTab() {
  const [clientes, setClientes] = useState([]);
  const [clienteId, setClienteId] = useState("");

  const [fazendas, setFazendas] = useState([]);
  const fazendaNomePorId = useMemo(() => {
    const map = new Map();
    (fazendas || []).forEach((f) => map.set(String(f.id), f.fazenda));
    return map;
  }, [fazendas]);

  const [lavouras, setLavouras] = useState([]);
  const [abrirForm, setAbrirForm] = useState(false);
  const [editar, setEditar] = useState(null);

  const [busca, setBusca] = useState("");

  const lavourasFiltradas = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return lavouras;

    return (lavouras || []).filter((l) => {
      const nome = String(l.nome || "").toLowerCase();
      const fazenda = String(
        fazendaNomePorId.get(String(l.fazenda_id)) || ""
      ).toLowerCase();
      return nome.includes(q) || fazenda.includes(q);
    });
  }, [lavouras, busca, fazendaNomePorId]);

  // confirm excluir
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [alvoExcluir, setAlvoExcluir] = useState(null);

  function abrirConfirmExcluir(lavoura) {
    setAlvoExcluir({
      id: lavoura.id,
      lavoura: lavoura.nome,
      fazenda: fazendaNomePorId.get(String(lavoura.fazenda_id)) || "—",
    });
    setConfirmOpen(true);
  }

  function fecharConfirmExcluir() {
    setConfirmOpen(false);
    setAlvoExcluir(null);
  }

  async function confirmarExcluir() {
    if (!alvoExcluir?.id) return;

    try {
      await api.delete(`/lavouras/${alvoExcluir.id}`);
      setLavouras((prev) =>
        (prev || []).filter((l) => l.id !== alvoExcluir.id)
      );
      notificar("sucesso", "Lavoura removida.");
    } catch (err) {
      notificar(
        "erro",
        err?.response?.data?.erro || "Erro ao excluir lavoura."
      );
    } finally {
      fecharConfirmExcluir();
    }
  }

  // loaders
  async function carregarClientes() {
    try {
      const { data } = await api.get("/clientes");
      const lista = Array.isArray(data) ? data : [];
      setClientes(lista);
      if (!clienteId && lista.length) setClienteId(lista[0].id);
    } catch {
      notificar("erro", "Erro ao carregar clientes.");
      setClientes([]);
    }
  }

  async function carregarFazendas(cid) {
    if (!cid) return setFazendas([]);
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

  async function carregarLavouras(cid) {
    if (!cid) return setLavouras([]);
    try {
      const { data } = await api.get(`/lavouras/${cid}`);
      setLavouras(Array.isArray(data) ? data : []);
    } catch {
      notificar("erro", "Erro ao carregar lavouras.");
      setLavouras([]);
    }
  }

  useEffect(() => {
    carregarClientes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    carregarFazendas(clienteId);
    carregarLavouras(clienteId);
    setBusca("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clienteId]);

  return (
    <>
      <div className="settings-header settings-header--stack">
        <h2>Lavouras</h2>

        <div className="settings-header-actions settings-actions-wrap">
          <div className="select-wrapper" style={{ maxWidth: 320 }}>
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

          <div className="settings-search">
            <FontAwesomeIcon icon={faSearch} />
            <input
              placeholder="Buscar lavoura ou fazenda..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

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
            <th>Fazenda</th>
            <th width="160">Ações</th>
          </tr>
        </thead>

        <tbody>
          {lavourasFiltradas.map((l) => (
            <tr key={l.id}>
              <td>{l.nome}</td>
              <td>{fazendaNomePorId.get(String(l.fazenda_id)) || "-"}</td>
              <td className="acoes">
                <button
                  type="button"
                  className="acao editar"
                  onClick={() => setEditar(l)}
                  title="Editar"
                >
                  <FontAwesomeIcon icon={faPen} />
                </button>

                <button
                  type="button"
                  className="acao danger"
                  onClick={() => abrirConfirmExcluir(l)}
                  title="Excluir"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </td>
            </tr>
          ))}

          {lavouras.length === 0 && (
            <tr className="empty-row">
              <td colSpan={3}>Nenhuma lavoura cadastrada para este cliente.</td>
            </tr>
          )}

          {lavouras.length > 0 && lavourasFiltradas.length === 0 && (
            <tr className="empty-row">
              <td colSpan={3}>Nenhuma lavoura encontrada para essa busca.</td>
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

      <ConfirmDialog
        open={confirmOpen}
        title="Excluir lavoura"
        description={
          alvoExcluir
            ? `Lavoura: ${alvoExcluir.lavoura}\nFazenda: ${alvoExcluir.fazenda}\n\nEsta ação não pode ser desfeita.`
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

export default LavourasTab;
