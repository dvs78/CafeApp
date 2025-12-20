// src/pages/settings/tabs/SafrasTab.jsx
import { useEffect, useMemo, useState } from "react";
import api from "../../../services/api";
import { notificar } from "../../../components/Toast";
import FormSafra from "../components/FormSafra";
import ConfirmDialog from "../../../components/ConfirmDialog/ConfirmDialog";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash, faSearch } from "@fortawesome/free-solid-svg-icons";

function SafrasTab() {
  const [safras, setSafras] = useState([]);
  const [abrirForm, setAbrirForm] = useState(false);
  const [editar, setEditar] = useState(null);

  // 🔎 busca
  const [busca, setBusca] = useState("");

  // ConfirmDialog
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [alvoExcluir, setAlvoExcluir] = useState(null);

  async function carregar() {
    try {
      const { data } = await api.get("/safras-lista");
      setSafras(Array.isArray(data) ? data : []);
    } catch {
      notificar("erro", "Erro ao carregar safras.");
      setSafras([]);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  function abrirConfirmExcluir(safra) {
    setAlvoExcluir({ id: safra.id, nome: safra.nome });
    setConfirmOpen(true);
  }

  function fecharConfirmExcluir() {
    setConfirmOpen(false);
    setAlvoExcluir(null);
  }

  async function confirmarExcluir() {
    if (!alvoExcluir?.id) return;

    try {
      await api.delete(`/safras-lista/${alvoExcluir.id}`);
      setSafras((prev) => prev.filter((s) => s.id !== alvoExcluir.id));
      notificar("sucesso", "Safra removida.");
    } catch (err) {
      const msg = err?.response?.data?.erro || "Erro ao excluir safra.";
      notificar("erro", msg);
    } finally {
      fecharConfirmExcluir();
    }
  }

  const safrasFiltradas = useMemo(() => {
    const txt = (busca || "").trim().toLowerCase();
    if (!txt) return safras;

    return (safras || []).filter((s) =>
      (s.nome || "").toLowerCase().includes(txt)
    );
  }, [safras, busca]);

  return (
    <>
      <div className="settings-header settings-header--stack">
        <h2>Safras</h2>

        <div className="settings-header-actions settings-actions-wrap">
          {/* Busca */}
          <div className="settings-search">
            <FontAwesomeIcon icon={faSearch} />
            <input
              placeholder="Buscar safra..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

          <button
            className="btn-primary"
            type="button"
            onClick={() => setAbrirForm(true)}
          >
            Nova Safra
          </button>
        </div>
      </div>

      <table className="settings-table">
        <thead>
          <tr>
            <th>Safra</th>
            <th width="160">Ações</th>
          </tr>
        </thead>

        <tbody>
          {safrasFiltradas.map((s) => (
            <tr key={s.id}>
              <td>{s.nome}</td>

              <td className="acoes">
                <button
                  type="button"
                  className="acao editar"
                  onClick={() => setEditar(s)}
                  title="Editar safra"
                >
                  <FontAwesomeIcon icon={faPen} />
                </button>

                <button
                  type="button"
                  className="acao danger"
                  onClick={() => abrirConfirmExcluir(s)}
                  title="Excluir safra"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </td>
            </tr>
          ))}

          {safrasFiltradas.length === 0 && (
            <tr className="empty-row">
              <td colSpan={2}>Nenhuma safra encontrada.</td>
            </tr>
          )}
        </tbody>
      </table>

      {(abrirForm || editar) && (
        <FormSafra
          safra={editar}
          onClose={() => {
            setAbrirForm(false);
            setEditar(null);
          }}
          onSaved={() => carregar()}
        />
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Excluir safra"
        description={
          alvoExcluir
            ? `Tem certeza que deseja excluir a safra "${alvoExcluir.nome}"?\nEsta ação não pode ser desfeita.`
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

export default SafrasTab;
