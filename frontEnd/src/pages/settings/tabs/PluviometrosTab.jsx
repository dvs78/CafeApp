import { useEffect, useMemo, useState } from "react";
import api from "../../../services/api";
import { notificar } from "../../../components/Toast";
import FormPluviometro from "../components/FormPluviometro";
import ConfirmDialog from "../../../components/ConfirmDialog";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash } from "@fortawesome/free-solid-svg-icons";

function PluviometrosTab() {
  const [clientes, setClientes] = useState([]);
  const [clienteId, setClienteId] = useState("");

  const [fazendas, setFazendas] = useState([]);
  const fazendaNomePorId = useMemo(() => {
    const map = new Map();
    (fazendas || []).forEach((f) => map.set(String(f.id), f.fazenda));
    return map;
  }, [fazendas]);

  const [pluviometros, setPluviometros] = useState([]);
  const [abrirForm, setAbrirForm] = useState(false);
  const [editar, setEditar] = useState(null);

  // -------------------------
  // CONFIRM DIALOG (EXCLUIR)
  // -------------------------
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [alvoExcluir, setAlvoExcluir] = useState(null);

  function abrirConfirmExcluir(p) {
    const nomeFazenda = fazendaNomePorId.get(String(p.fazenda_id)) || "—";

    setAlvoExcluir({
      id: p.id,
      pluviometro: p.nome,
      fazenda: nomeFazenda,
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
      setPluviometros((prev) => prev.filter((x) => x.id !== alvoExcluir.id));
      notificar("sucesso", "Pluviômetro removido.");
    } catch (err) {
      const msg = err?.response?.data?.erro || "Erro ao excluir pluviômetro.";
      notificar("erro", msg);
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
      setClientes(data || []);
      if (!clienteId && (data || []).length) setClienteId(data[0].id);
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
      setFazendas(data || []);
    } catch {
      notificar("erro", "Erro ao carregar fazendas.");
      setFazendas([]);
    }
  }

  async function carregarPluviometros(cid) {
    if (!cid) return setPluviometros([]);
    try {
      const { data } = await api.get(`/pluviometros/${cid}`);
      setPluviometros(data || []);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clienteId]);

  return (
    <>
      <div className="settings-header">
        <h2>Pluviômetros</h2>

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
          {pluviometros.map((p) => (
            <tr key={p.id}>
              <td>{p.nome}</td>
              <td>{fazendaNomePorId.get(String(p.fazenda_id)) || "-"}</td>

              <td className="acoes">
                <button
                  type="button"
                  className="acao editar"
                  onClick={() => setEditar(p)}
                  title="Editar"
                >
                  <FontAwesomeIcon icon={faPen} />
                </button>

                <button
                  type="button"
                  className="acao danger"
                  onClick={() => abrirConfirmExcluir(p)}
                  title="Excluir"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </td>
            </tr>
          ))}

          {pluviometros.length === 0 && (
            <tr>
              <td colSpan={3}>
                Nenhum pluviômetro cadastrado para este cliente.
              </td>
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
            ? `Você está prestes a excluir o pluviômetro:\n\n` +
              `Pluviômetro: ${alvoExcluir.pluviometro}\n` +
              `Fazenda: ${alvoExcluir.fazenda}\n\n` +
              `Esta ação não pode ser desfeita.`
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
