import "./Realizado.css";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
// import axios from "axios";
import api from "../../services/api";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faPlus, faTimes } from "@fortawesome/free-solid-svg-icons";

import RealizadoForm from "./RealizadoForm";
import RealizadoLista from "./RealizadoLista";
import ConfirmDialog from "../../components/ConfirmDialog";
import { notificar } from "../../components/Toast";
import { useAuth } from "../../context/AuthContext";

// HELPERS
function formatarData(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("pt-BR");
}
function limparQuantidade(valor) {
  if (!valor) return null;
  const txt = valor.toString().replace(/\./g, "").replace(",", ".");
  const num = Number(txt);
  return Number.isNaN(num) ? null : num;
}
function normalizar(v) {
  return (v ?? "").toString().trim().toLowerCase();
}
function formatarQuantidadeParaInput(valor) {
  if (valor === null || valor === undefined) return "";
  const n = Number(valor);
  if (Number.isNaN(n)) return "";
  return n
    .toLocaleString("pt-BR", { minimumFractionDigits: 2 })
    .replace(/\./g, "");
}

function Realizado({
  mostrarFiltros,
  setOcultarBotaoFiltros,
  setTituloCustom,
}) {
  const navigate = useNavigate();
  const { token, usuario, workspace } = useAuth();

  // workspace (com fallback do localStorage)
  const fazenda =
    workspace?.fazenda || localStorage.getItem("ctx_fazenda") || "";
  const safra = workspace?.safra || localStorage.getItem("ctx_safra") || "";

  // PROTEÇÃO
  useEffect(() => {
    if (!usuario || !token) {
      navigate("/login");
      return;
    }
    if (!fazenda || !safra) {
      notificar("erro", "Selecione Fazenda e Safra para continuar.");
      navigate("/poslogin");
    }
  }, [usuario, token, fazenda, safra, navigate]);

  // CAMPOS FORM
  const [lavoura, setLavoura] = useState("");
  const [servico, setServico] = useState("");
  const [data, setData] = useState("");
  const [status, setStatus] = useState("");
  const [produto, setProduto] = useState("");
  const [uni, setUni] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [editandoId, setEditandoId] = useState(null);

  const [confirmDuplicado, setConfirmDuplicado] = useState(false);

  // LISTAS
  const [servicos, setServicos] = useState([]);
  const [listaLavouras, setListaLavouras] = useState([]);
  const [listaProdutos, setListaProdutos] = useState([]);
  const [listaServicos, setListaServicos] = useState([]);

  // UI
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  // FILTROS
  const [filtroMes, setFiltroMes] = useState("");
  const [filtroAno, setFiltroAno] = useState("");
  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroLavoura, setFiltroLavoura] = useState("");
  const [filtroServico, setFiltroServico] = useState("");

  // HEADER
  useEffect(() => {
    setOcultarBotaoFiltros(mostrarFormulario);

    // aqui recomendo não “poluir” o título com fazenda/safra, porque já está no header-contexto
    setTituloCustom("Serviços");

    return () => setTituloCustom("");
  }, [mostrarFormulario, setOcultarBotaoFiltros, setTituloCustom]);

  // CARREGAR DADOS
  useEffect(() => {
    if (!token || !usuario) return;

    api
      .get("/realizado", {
        headers: {
          Authorization: `Bearer ${token}`,
          "cliente-id": usuario.clienteId,
        },
      })
      .then((res) => setServicos(res.data))
      .catch(() => notificar("erro", "Erro ao carregar serviços."));
  }, [token, usuario]);

  useEffect(() => {
    if (!usuario) return;

    Promise.all([
      api.get(`/lavouras/${usuario.clienteId}`),
      api.get("/produtos"),
      api.get("/servicos-lista"),
    ])
      .then(([l, p, s]) => {
        setListaLavouras(l.data);
        setListaProdutos(p.data);
        setListaServicos(s.data);
      })
      .catch(() => notificar("erro", "Erro ao carregar listas."));
  }, [usuario]);

  // Lavouras “relevantes” da safra
  const lavourasDaSafra = useMemo(() => {
    if (!safra) return listaLavouras;

    const nomesUsados = new Set(
      servicos
        .filter((s) => s.safra === safra)
        .map((s) => s.lavoura)
        .filter(Boolean)
    );

    if (nomesUsados.size === 0) return listaLavouras;
    return listaLavouras.filter((lav) => nomesUsados.has(lav.nome));
  }, [safra, servicos, listaLavouras]);

  // FILTRAGEM
  const servicosFiltrados = useMemo(() => {
    return servicos.filter((s) => {
      if (safra && s.safra !== safra) return false;

      if (filtroLavoura && s.lavoura !== filtroLavoura) return false;
      if (filtroServico && s.servico !== filtroServico) return false;

      const [ano, mes] = (s.data || "").split("-");
      if (filtroMes && mes !== filtroMes) return false;
      if (filtroAno && ano !== filtroAno) return false;

      if (filtroTexto) {
        const texto =
          `${s.lavoura} ${s.servico} ${s.produto} ${s.status}`.toLowerCase();
        if (!texto.includes(filtroTexto.toLowerCase())) return false;
      }

      return true;
    });
  }, [
    servicos,
    safra,
    filtroMes,
    filtroAno,
    filtroTexto,
    filtroLavoura,
    filtroServico,
  ]);

  // CRUD
  function handleSubmit(e) {
    e.preventDefault();

    if (!lavoura || !servico || !data || !status) {
      notificar("erro", "Preencha os campos obrigatórios.");
      return;
    }

    if (!usuario || !token) return;

    const existeDuplicado = servicos.some((s) => {
      return (
        s.id !== editandoId &&
        normalizar(s.safra) === normalizar(safra) &&
        normalizar(s.lavoura) === normalizar(lavoura) &&
        normalizar(s.servico) === normalizar(servico) &&
        normalizar(s.produto) === normalizar(produto)
      );
    });

    if (existeDuplicado) {
      notificar(
        "erro",
        "Já existe lançamento com a mesma Safra, Lavoura, Serviço e Produto."
      );
      setConfirmDuplicado(true);
      return;
    }

    const payload = {
      safra,
      lavoura,
      servico,
      data,
      status,
      produto: produto || null,
      unidade: uni || null,
      quantidade: limparQuantidade(quantidade),
      cliente_id: usuario.clienteId,
      usuario_id: usuario.id,
    };

    const req = editandoId
      ? api.put(`/realizado/${editandoId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        })
      : api.post("/realizado", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });

    req
      .then((res) => {
        if (editandoId) {
          setServicos((prev) =>
            prev.map((s) => (s.id === editandoId ? res.data : s))
          );
          notificar("sucesso", "Serviço atualizado.");
        } else {
          setServicos((prev) => [res.data, ...prev]);
          notificar("sucesso", "Serviço lançado.");
        }
        fecharFormulario();
      })
      .catch(() => notificar("erro", "Erro ao salvar."));
  }

  function handleEditar(s) {
    setEditandoId(s.id);
    setLavoura(s.lavoura || "");
    setServico(s.servico || "");
    setData(s.data ? s.data.split("T")[0] : "");
    setStatus(s.status || "");
    setProduto(s.produto || "");
    setUni(s.unidade || "");
    setQuantidade(formatarQuantidadeParaInput(s.quantidade));
    setMostrarFormulario(true);
  }

  function handleExcluir(id) {
    if (!token) return;

    api
      .delete(`/realizado/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setServicos((prev) => prev.filter((s) => s.id !== id));
        notificar("sucesso", "Serviço excluído.");
      })
      .catch(() => notificar("erro", "Erro ao excluir serviço."));
  }

  function fecharFormulario() {
    setMostrarFormulario(false);
    setEditandoId(null);
    setLavoura("");
    setServico("");
    setData("");
    setStatus("");
    setProduto("");
    setUni("");
    setQuantidade("");
  }

  // EXPORTAÇÃO
  function exportarExcel() {
    const ws = XLSX.utils.json_to_sheet(servicosFiltrados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Serviços");
    XLSX.writeFile(wb, "servicos.xlsx");
  }

  function exportarPDF() {
    const doc = new jsPDF();
    doc.text(`Serviços - ${safra || ""}`, 10, 10);
    let y = 20;

    servicosFiltrados.forEach((s) => {
      doc.text(
        `${formatarData(s.data)} - ${s.servico} - ${s.quantidade || ""}`,
        10,
        y
      );
      y += 8;
    });

    doc.save("servicos.pdf");
  }

  // RENDER (SEM main.app-main aqui)
  return (
    <div className="realizado-page">
      {mostrarFormulario && (
        <RealizadoForm
          onSubmit={handleSubmit}
          editandoId={editandoId}
          safra={safra}
          lavoura={lavoura}
          setLavoura={setLavoura}
          servico={servico}
          setServico={setServico}
          data={data}
          setData={setData}
          status={status}
          setStatus={setStatus}
          produto={produto}
          setProduto={setProduto}
          uni={uni}
          setUni={setUni}
          quantidade={quantidade}
          setQuantidade={setQuantidade}
          listaLavouras={lavourasDaSafra}
          listaProdutos={listaProdutos}
          listaServicos={listaServicos}
          onCancelar={fecharFormulario}
        />
      )}

      {!mostrarFormulario && mostrarFiltros && (
        <section className="card filtros-card anima-card">
          <header className="filtros-topo">
            <h2 className="filtros-title">Filtros</h2>

            <button
              className="btn-limpar-filtros"
              type="button"
              onClick={() => {
                setFiltroMes("");
                setFiltroAno("");
                setFiltroTexto("");
                setFiltroLavoura("");
                setFiltroServico("");
              }}
            >
              Limpar filtros
            </button>
          </header>

          <div className="filtros-grid-2">
            <div className="login-campo filtro-mes">
              <label className="login-label">Mês</label>
              <select
                className="login-input"
                value={filtroMes}
                onChange={(e) => setFiltroMes(e.target.value)}
              >
                <option value="">Todos</option>
                {/* ... */}
              </select>
            </div>

            <div className="login-campo filtro-ano">
              <label className="login-label">Ano</label>
              <select
                className="login-input"
                value={filtroAno}
                onChange={(e) => setFiltroAno(e.target.value)}
              >
                <option value="">Todos</option>
                {/* ... */}
              </select>
            </div>

            <div className="login-campo filtro-lavoura">
              <label className="login-label">Lavoura</label>
              <select
                className="login-input"
                value={filtroLavoura}
                onChange={(e) => setFiltroLavoura(e.target.value)}
              >
                <option value="">Todas</option>
                {/* ... */}
              </select>
            </div>

            <div className="login-campo filtro-servico">
              <label className="login-label">Serviço</label>
              <select
                className="login-input"
                value={filtroServico}
                onChange={(e) => setFiltroServico(e.target.value)}
              >
                <option value="">Todos</option>
                {/* ... */}
              </select>
            </div>

            <div className="login-campo filtro-buscar">
              <label className="login-label">Buscar texto</label>
              <input
                className="login-input"
                placeholder="Ex.: adubação, roçagem..."
                value={filtroTexto}
                onChange={(e) => setFiltroTexto(e.target.value)}
              />
            </div>
          </div>
        </section>
      )}

      <RealizadoLista
        servicosFiltrados={servicosFiltrados}
        onEditar={handleEditar}
        onExcluir={handleExcluir}
        onExportarExcel={exportarExcel}
        onExportarPDF={exportarPDF}
      />

      <ConfirmDialog
        open={confirmDuplicado}
        title="Lançamento duplicado"
        description="Já existe um serviço lançado com esta Safra, Lavoura, Serviço e Produto."
        cancelLabel="Cancelar"
        onlyCancel
        onCancel={() => setConfirmDuplicado(false)}
        variant="danger"
      />

      <button
        className="fab"
        type="button"
        onClick={() => setMostrarFormulario((v) => !v)}
      >
        <FontAwesomeIcon icon={mostrarFormulario ? faTimes : faPlus} />
      </button>
    </div>
  );
}

export default Realizado;
