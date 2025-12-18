import "./Chuva.css";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTimes } from "@fortawesome/free-solid-svg-icons";

import ChuvaForm from "./ChuvaForm";
import ChuvaLista from "./ChuvaLista";
import ConfirmDialog from "../../components/ConfirmDialog";
import { notificar } from "../../components/Toast";
import { useAuth } from "../../context/AuthContext";

// ------------------------------
// HELPERS
// ------------------------------
function extrairAnoMes(dataISO) {
  if (!dataISO) return { ano: "", mes: "" };
  const d = new Date(dataISO);
  if (Number.isNaN(d.getTime())) return { ano: "", mes: "" };

  return {
    ano: String(d.getFullYear()),
    mes: String(d.getMonth() + 1).padStart(2, "0"),
  };
}

function formatarDataBR(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("pt-BR");
}

function Chuva({ mostrarFiltros, setOcultarBotaoFiltros, setTituloCustom }) {
  const navigate = useNavigate();
  const { token, usuario, workspace } = useAuth();

  // ------------------------------
  // CONTEXTO
  // ------------------------------
  const clienteId =
    workspace?.clienteId || localStorage.getItem("ctx_cliente_id") || "";

  const fazendaId =
    workspace?.fazendaId || localStorage.getItem("ctx_fazenda_id") || "";

  const safraId =
    workspace?.safraId || localStorage.getItem("ctx_safra_id") || "";

  // ------------------------------
  // STATE
  // ------------------------------
  const [chuvas, setChuvas] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editando, setEditando] = useState(null);

  const [confirmExcluir, setConfirmExcluir] = useState(false);
  const [chuvaParaExcluir, setChuvaParaExcluir] = useState(null);

  // filtros
  const [filtroMes, setFiltroMes] = useState("");
  const [filtroAno, setFiltroAno] = useState("");

  // ------------------------------
  // HEADER
  // ------------------------------
  useEffect(() => {
    setOcultarBotaoFiltros?.(false);
    setTituloCustom?.("Chuvas");
    return () => setTituloCustom?.("");
  }, [setOcultarBotaoFiltros, setTituloCustom]);

  // ------------------------------
  // GUARDAS DE SEGURANÇA
  // ------------------------------
  useEffect(() => {
    if (!usuario || !token) {
      navigate("/login", { replace: true });
      return;
    }

    if (!clienteId || !fazendaId || !safraId) {
      notificar("erro", "Selecione Cliente, Fazenda e Safra para continuar.");
      navigate("/poslogin", { replace: true });
    }
  }, [usuario, token, clienteId, fazendaId, navigate]);

  // ------------------------------
  // CARREGAR CHUVAS
  // ------------------------------
  useEffect(() => {
    if (!clienteId || !fazendaId) return;

    api
      .get(`/chuvas/${clienteId}`, {
        params: { fazenda_id: fazendaId, safra_id: safraId },
      })
      .then((res) => setChuvas(Array.isArray(res.data) ? res.data : []))
      .catch(() => notificar("erro", "Erro ao carregar chuvas."));
  }, [clienteId, fazendaId]);

  // ------------------------------
  // FILTROS
  // ------------------------------
  const chuvasFiltradas = useMemo(() => {
    return (chuvas || []).filter((c) => {
      const { ano, mes } = extrairAnoMes(c.data);
      if (filtroMes && mes !== filtroMes) return false;
      if (filtroAno && ano !== filtroAno) return false;
      return true;
    });
  }, [chuvas, filtroMes, filtroAno]);

  // ------------------------------
  // AÇÕES
  // ------------------------------
  function handleEditar(chuva) {
    setEditando(chuva);
    setMostrarFormulario(true);
  }

  function pedirExcluir(chuva) {
    setChuvaParaExcluir(chuva);
    setConfirmExcluir(true);
  }

  function confirmarExcluir() {
    if (!chuvaParaExcluir?.id) return;

    api
      .delete(`/chuvas/${chuvaParaExcluir.id}`)
      .then(() => {
        setChuvas((prev) => prev.filter((c) => c.id !== chuvaParaExcluir.id));
        notificar("sucesso", "Chuva excluída.");
      })
      .catch(() => notificar("erro", "Erro ao excluir chuva."))
      .finally(() => {
        setConfirmExcluir(false);
        setChuvaParaExcluir(null);
      });
  }

  function fecharFormulario() {
    setMostrarFormulario(false);
    setEditando(null);
  }

  // ------------------------------
  // RENDER
  // ------------------------------
  return (
    <div className="chuva-page">
      {mostrarFormulario && (
        <ChuvaForm
          editando={editando}
          onSaved={(novo) => {
            if (editando) {
              setChuvas((prev) =>
                prev.map((c) => (c.id === novo.id ? novo : c))
              );
            } else {
              setChuvas((prev) => [novo, ...prev]);
            }
            fecharFormulario();
          }}
          onCancelar={fecharFormulario}
        />
      )}

      {!mostrarFormulario && (
        <ChuvaLista
          chuvas={chuvasFiltradas}
          onEditar={handleEditar}
          onExcluir={pedirExcluir}
          filtroMes={filtroMes}
          setFiltroMes={setFiltroMes}
          filtroAno={filtroAno}
          setFiltroAno={setFiltroAno}
        />
      )}

      {/* FAB */}
      <button
        className="fab"
        type="button"
        onClick={() => setMostrarFormulario((v) => !v)}
      >
        <FontAwesomeIcon icon={mostrarFormulario ? faTimes : faPlus} />
      </button>

      {/* CONFIRMAÇÃO */}
      <ConfirmDialog
        open={confirmExcluir}
        title="Excluir chuva?"
        description={
          chuvaParaExcluir
            ? `Data: ${formatarDataBR(chuvaParaExcluir.data)}
Pluviômetro: ${chuvaParaExcluir.pluviometro || "-"}
Chuva: ${chuvaParaExcluir.chuva} mm

Essa ação não pode ser desfeita.`
            : "Essa ação não pode ser desfeita."
        }
        cancelLabel="Cancelar"
        confirmLabel="Excluir"
        onCancel={() => {
          setConfirmExcluir(false);
          setChuvaParaExcluir(null);
        }}
        onConfirm={confirmarExcluir}
        variant="danger"
      />
    </div>
  );
}

export default Chuva;
