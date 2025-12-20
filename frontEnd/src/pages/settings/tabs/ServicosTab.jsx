// src/pages/settings/tabs/ServicosTab.jsx
import { useEffect, useMemo, useState } from "react";
import api from "../../../services/api";
import { notificar } from "../../../components/Toast";
import FormServico from "../components/FormServico";
import ConfirmDialog from "../../../components/ConfirmDialog/ConfirmDialog";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash, faSearch } from "@fortawesome/free-solid-svg-icons";

function normalizarTexto(txt) {
  return (txt || "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function ServicosTab() {
  const [servicos, setServicos] = useState([]);
  const [abrirForm, setAbrirForm] = useState(false);
  const [editar, setEditar] = useState(null);

  // 🔎 busca (com debounce)
  const [busca, setBusca] = useState("");
  const [buscaDebounced, setBuscaDebounced] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setBuscaDebounced(busca), 250);
    return () => clearTimeout(t);
  }, [busca]);

  const servicosFiltrados = useMemo(() => {
    const termo = normalizarTexto(buscaDebounced);
    if (!termo) return servicos;

    return (servicos || []).filter((s) =>
      normalizarTexto(s?.nome).includes(termo)
    );
  }, [servicos, buscaDebounced]);

  // -------------------------
  // CONFIRM DIALOG (EXCLUIR)
  // -------------------------
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [alvoExcluir, setAlvoExcluir] = useState(null);

  function abrirConfirmExcluir(servico) {
    setAlvoExcluir({ id: servico.id, nome: servico.nome });
    setConfirmOpen(true);
  }

  function fecharConfirmExcluir() {
    setConfirmOpen(false);
    setAlvoExcluir(null);
  }

  async function confirmarExcluir() {
    if (!alvoExcluir?.id) return;

    try {
      await api.delete(`/servicos-lista/${alvoExcluir.id}`);
      setServicos((prev) => prev.filter((s) => s.id !== alvoExcluir.id));
      notificar("sucesso", "Serviço removido.");
    } catch (err) {
      const msg = err?.response?.data?.erro || "Erro ao excluir serviço.";
      notificar("erro", msg);
    } finally {
      fecharConfirmExcluir();
    }
  }

  // -------------------------
  // LOAD
  // -------------------------
  async function carregar() {
    try {
      const { data } = await api.get("/servicos-lista");
      setServicos(Array.isArray(data) ? data : []);
    } catch {
      notificar("erro", "Erro ao carregar serviços.");
      setServicos([]);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  return (
    <>
      <div className="settings-header settings-header--stack">
        <h2>Serviços</h2>

        <div className="settings-header-actions settings-actions-wrap">
          <div className="settings-search">
            <FontAwesomeIcon icon={faSearch} />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar serviço..."
            />
          </div>

          <button
            className="btn-primary"
            type="button"
            onClick={() => setAbrirForm(true)}
          >
            Novo Serviço
          </button>
        </div>
      </div>

      <div style={{ margin: "6px 0 12px", opacity: 0.7, fontSize: 13 }}>
        Mostrando {servicosFiltrados.length} de {servicos.length}
      </div>

      <table className="settings-table">
        <thead>
          <tr>
            <th>Serviço</th>
            <th width="160">Ações</th>
          </tr>
        </thead>

        <tbody>
          {servicosFiltrados.map((s) => (
            <tr key={s.id}>
              <td>{s.nome}</td>

              <td className="acoes">
                <button
                  type="button"
                  className="acao editar"
                  onClick={() => setEditar(s)}
                  title="Editar serviço"
                >
                  <FontAwesomeIcon icon={faPen} />
                </button>

                <button
                  type="button"
                  className="acao danger"
                  onClick={() => abrirConfirmExcluir(s)}
                  title="Excluir serviço"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </td>
            </tr>
          ))}

          {servicosFiltrados.length === 0 && (
            <tr className="empty-row">
              <td colSpan={2}>
                {busca.trim()
                  ? "Nenhum serviço encontrado para essa busca."
                  : "Nenhum serviço cadastrado."}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {(abrirForm || editar) && (
        <FormServico
          servico={editar}
          onClose={() => {
            setAbrirForm(false);
            setEditar(null);
          }}
          onSaved={() => {
            carregar();
            setBusca("");
          }}
        />
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Excluir serviço"
        description={
          alvoExcluir
            ? `Tem certeza que deseja excluir o serviço "${alvoExcluir.nome}"?\nEsta ação não pode ser desfeita.`
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

export default ServicosTab;
