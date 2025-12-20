import { useEffect, useMemo, useState } from "react";
import api from "../../../services/api";
import { notificar } from "../../../components/Toast";
import FormPluviometro from "../components/FormPluviometro";

import ConfirmDialog from "../../../components/ConfirmDialog/ConfirmDialog";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPen,
  faTrash,
  faSearch,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";

function PluviometrosTab() {
  const [clientes, setClientes] = useState([]);
  const [clienteId, setClienteId] = useState("");

  const [fazendas, setFazendas] = useState([]);
  const [pluviometros, setPluviometros] = useState([]);

  const [abrirForm, setAbrirForm] = useState(false);
  const [editar, setEditar] = useState(null);

  const [busca, setBusca] = useState("");

  // -------------------------
  // MAP FAZENDA
  // -------------------------
  const fazendaNomePorId = useMemo(() => {
    const map = new Map();
    (fazendas || []).forEach((f) => map.set(String(f.id), f.fazenda));
    return map;
  }, [fazendas]);

  // -------------------------
  // CONFIRM DIALOG
  // -------------------------
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [alvoExcluir, setAlvoExcluir] = useState(null);

  function abrirConfirmExcluir(p) {
    setAlvoExcluir({
      id: p.id,
      pluviometro: p.nome,
      fazenda: fazendaNomePorId.get(String(p.fazenda_id)) || "—",
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
      await api.delete(`/pluviometros/${alvoExcluir.id}`);
      setPluviometros((prev) => prev.filter((p) => p.id !== alvoExcluir.id));
      notificar("sucesso", "Pluviômetro removido.");
    } catch (err) {
      notificar(
        "erro",
        err?.response?.data?.erro || "Erro ao excluir pluviômetro."
      );
    } finally {
      fecharConfirmExcluir();
    }
  }

  // -------------------------
  // LOADERS
  // -------------------------
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

  async function carregarPluviometros(cid) {
    if (!cid) return setPluviometros([]);
    try {
      const { data } = await api.get(`/pluviometros/${cid}`);
      setPluviometros(Array.isArray(data) ? data : []);
    } catch {
      notificar("erro", "Erro ao carregar pluviômetros.");
      setPluviometros([]);
    }
  }

  useEffect(() => {
    carregarClientes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    carregarFazendas(clienteId);
    carregarPluviometros(clienteId);
    setBusca("");
  }, [clienteId]);

  const listaFiltrada = useMemo(() => {
    const txt = busca.trim().toLowerCase();
    if (!txt) return pluviometros;

    return pluviometros.filter((p) =>
      `${p.nome} ${fazendaNomePorId.get(String(p.fazenda_id)) || ""}`
        .toLowerCase()
        .includes(txt)
    );
  }, [pluviometros, busca, fazendaNomePorId]);

  return (
    <>
      <div className="settings-header settings-header--stack">
        <h2>Pluviômetros</h2>

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
              placeholder="Buscar pluviômetro..."
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
            Novo Pluviômetro
          </button>
        </div>
      </div>

      <table className="settings-table">
        <thead>
          <tr>
            <th>Pluviômetro</th>
            <th>Fazenda</th>
            <th width="160">Ações</th>
          </tr>
        </thead>

        <tbody>
          {listaFiltrada.map((p) => (
            <tr key={p.id}>
              <td>{p.nome}</td>
              <td>{fazendaNomePorId.get(String(p.fazenda_id)) || "-"}</td>

              <td className="acoes">
                <button
                  className="acao editar"
                  type="button"
                  title="Editar pluviômetro"
                  onClick={() => setEditar(p)}
                >
                  <FontAwesomeIcon icon={faPen} />
                </button>

                <button
                  className="acao danger"
                  type="button"
                  title="Excluir pluviômetro"
                  onClick={() => abrirConfirmExcluir(p)}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </td>
            </tr>
          ))}

          {listaFiltrada.length === 0 && (
            <tr className="empty-row">
              <td colSpan={3}>Nenhum pluviômetro encontrado.</td>
            </tr>
          )}
        </tbody>
      </table>

      {(abrirForm || editar) && (
        <FormPluviometro
          clienteId={clienteId}
          pluviometro={editar}
          onClose={() => {
            setAbrirForm(false);
            setEditar(null);
          }}
          onSaved={() => carregarPluviometros(clienteId)}
        />
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Excluir pluviômetro"
        description={
          alvoExcluir
            ? `Você está prestes a excluir o pluviômetro:\n\nPluviômetro: ${alvoExcluir.pluviometro}\nFazenda: ${alvoExcluir.fazenda}\n\nEsta ação não pode ser desfeita.`
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

export default PluviometrosTab;
