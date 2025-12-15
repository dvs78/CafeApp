import "./Realizado.css";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTimes } from "@fortawesome/free-solid-svg-icons";

import RealizadoForm from "./RealizadoForm";
import RealizadoLista from "./RealizadoLista";
import ConfirmDialog from "../../components/ConfirmDialog";
import { notificar } from "../../components/Toast";
import { useAuth } from "../../context/AuthContext";

// ------------------------------
// HELPERS
// ------------------------------
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

/**
 * BUGFIX: data vem como ISO tipo "2025-11-18T03:00:00.000Z"
 * NÃO pode fazer split("-") esperando só YYYY-MM-DD.
 */
function extrairAnoMes(dataISO) {
  if (!dataISO) return { ano: "", mes: "" };
  const d = new Date(dataISO);
  if (Number.isNaN(d.getTime())) return { ano: "", mes: "" };
  const ano = String(d.getFullYear());
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  return { ano, mes };
}

function Realizado({
  mostrarFiltros,
  setOcultarBotaoFiltros,
  setTituloCustom,
}) {
  const navigate = useNavigate();
  const { token, usuario, workspace } = useAuth();
  const clienteId =
    workspace?.clienteId ||
    localStorage.getItem("ctx_cliente_id") ||
    usuario?.clienteId || // fallback antigo (se existir)
    "";

  // workspace (com fallback do localStorage)
  const fazenda =
    workspace?.fazenda || localStorage.getItem("ctx_fazenda") || "";
  const safra = workspace?.safra || localStorage.getItem("ctx_safra") || "";

  // ------------------------------
  // PROTEÇÃO
  // ------------------------------
  useEffect(() => {
    if (!usuario || !token) {
      navigate("/login");
      return;
    }
    if (!clienteId || !fazenda || !safra) {
      notificar("erro", "Selecione Cliente, Fazenda e Safra para continuar.");
      navigate("/poslogin");
    }
  }, [usuario, token, clienteId, fazenda, safra, navigate]);

  // ------------------------------
  // CAMPOS FORM
  // ------------------------------
  const [lavoura, setLavoura] = useState("");
  const [servico, setServico] = useState("");
  const [data, setData] = useState("");
  const [status, setStatus] = useState("");
  const [produto, setProduto] = useState("");
  const [uni, setUni] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [editandoId, setEditandoId] = useState(null);

  const [confirmDuplicado, setConfirmDuplicado] = useState(false);

  // ------------------------------
  // LISTAS
  // ------------------------------
  const [servicos, setServicos] = useState([]);
  const [listaLavouras, setListaLavouras] = useState([]);
  const [listaProdutos, setListaProdutos] = useState([]);
  const [listaServicos, setListaServicos] = useState([]);

  // ------------------------------
  // UI
  // ------------------------------
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  // ------------------------------
  // FILTROS
  // ------------------------------
  const [filtroMes, setFiltroMes] = useState("");
  const [filtroAno, setFiltroAno] = useState("");
  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroLavoura, setFiltroLavoura] = useState("");
  const [filtroServico, setFiltroServico] = useState("");

  // ------------------------------
  // HEADER
  // ------------------------------
  useEffect(() => {
    setOcultarBotaoFiltros(mostrarFormulario);
    setTituloCustom("Serviços");
    return () => setTituloCustom("");
  }, [mostrarFormulario, setOcultarBotaoFiltros, setTituloCustom]);

  // ------------------------------
  // CARREGAR DADOS (Realizado)
  // ------------------------------
  useEffect(() => {
    if (!token || !usuario || !clienteId) return;

    api
      .get("/realizado", { params: { clienteId, fazenda, safra } })
      .then((res) => setServicos(Array.isArray(res.data) ? res.data : []))
      .catch(() => notificar("erro", "Erro ao carregar serviços."));
  }, [token, usuario, clienteId, fazenda, safra]);

  // ------------------------------
  // CARREGAR LISTAS AUXILIARES
  // ------------------------------
  useEffect(() => {
    if (!usuario || !clienteId) return;

    Promise.all([
      api.get(`/lavouras/${clienteId}`),
      api.get("/produtos"),
      api.get("/servicos-lista"),
    ])
      .then(([l, p, s]) => {
        setListaLavouras(Array.isArray(l.data) ? l.data : []);
        setListaProdutos(Array.isArray(p.data) ? p.data : []);
        setListaServicos(Array.isArray(s.data) ? s.data : []);
      })
      .catch(() => notificar("erro", "Erro ao carregar listas."));
  }, [usuario, clienteId]);

  // ------------------------------
  // Lavouras “relevantes” da safra (para o FORM)
  // ------------------------------
  const lavourasDaSafra = useMemo(() => {
    if (!safra) return listaLavouras;

    const nomesUsados = new Set(
      (servicos || [])
        .filter((s) => s?.safra === safra)
        .map((s) => s?.lavoura)
        .filter(Boolean)
    );

    if (nomesUsados.size === 0) return listaLavouras;

    // listaLavouras do seu backend parece ter { nome: "..." }
    return (listaLavouras || []).filter((lav) => nomesUsados.has(lav?.nome));
  }, [safra, servicos, listaLavouras]);

  // ------------------------------
  // BASE DO CONTEXTO (cliente + safra + fazenda) — sem “zerar” se campo não existir
  // ------------------------------
  const servicosDoContexto = useMemo(() => {
    const lista = Array.isArray(servicos) ? servicos : [];

    // 1) safra (sempre tem no objeto, pelo seu JSON)
    let base = safra ? lista.filter((s) => s?.safra === safra) : lista;

    // 2) cliente (no seu JSON vem como "cliente_id")
    base = base.filter((s) => {
      const cid = s?.cliente_id ?? s?.clienteId ?? s?.cliente;
      return cid ? String(cid) === String(clienteId) : true;
    });

    // 3) fazenda: só filtra se existir campo de fazenda em algum item
    const temFazendaNoObjeto = base.some(
      (s) =>
        s?.fazenda !== undefined ||
        s?.fazenda_nome !== undefined ||
        s?.nome_fazenda !== undefined ||
        s?.fazendaId !== undefined ||
        s?.fazenda_id !== undefined
    );

    if (fazenda && temFazendaNoObjeto) {
      base = base.filter((s) => {
        const f =
          s?.fazenda ??
          s?.fazenda_nome ??
          s?.nome_fazenda ??
          s?.fazendaId ??
          s?.fazenda_id;

        return String(f ?? "") === String(fazenda);
      });
    }

    return base;
  }, [servicos, safra, fazenda, usuario]);

  function limparFiltros() {
    setFiltroMes("");
    setFiltroAno("");
    setFiltroTexto("");
    setFiltroLavoura("");
    setFiltroServico("");
  }

  // ------------------------------
  // OPÇÕES DOS SELECTS (usando dados do contexto)
  // ------------------------------
  const opcoesMes = useMemo(() => {
    const set = new Set();
    servicosDoContexto.forEach((s) => {
      const { mes } = extrairAnoMes(s?.data);
      if (mes) set.add(mes);
    });
    return Array.from(set).sort();
  }, [servicosDoContexto]);

  const opcoesAno = useMemo(() => {
    const set = new Set();
    servicosDoContexto.forEach((s) => {
      const { ano } = extrairAnoMes(s?.data);
      if (ano) set.add(ano);
    });
    return Array.from(set).sort((a, b) => Number(b) - Number(a));
  }, [servicosDoContexto]);

  const opcoesLavoura = useMemo(() => {
    // preferir lavourasDaSafra (do BD)
    const nomes = (lavourasDaSafra || []).map((l) => l?.nome).filter(Boolean);
    if (nomes.length)
      return [...new Set(nomes)].sort((a, b) => a.localeCompare(b));

    // fallback: tirar dos lançamentos
    const set = new Set();
    servicosDoContexto.forEach((s) => s?.lavoura && set.add(s.lavoura));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [lavourasDaSafra, servicosDoContexto]);

  const opcoesServico = useMemo(() => {
    const set = new Set();
    servicosDoContexto.forEach((s) => s?.servico && set.add(s.servico));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [servicosDoContexto]);

  const filtroPreviewLavoura = mostrarFormulario ? lavoura : "";
  const filtroPreviewServico = mostrarFormulario ? servico : "";

  // ------------------------------
  // FILTRAGEM FINAL (agora com data correta)
  // ------------------------------
  // ------------------------------
  // FILTRAGEM + ORDENAÇÃO (data desc)
  // ------------------------------
  const servicosFiltrados = useMemo(() => {
    // 1) base (use o contexto se quiser; se preferir, pode usar servicos direto)
    const base = Array.isArray(servicosDoContexto) ? servicosDoContexto : [];

    // 2) filtra primeiro (pelos seus filtros reais + preview)
    const filtrado = base.filter((s) => {
      // filtros do card
      if (filtroLavoura && s?.lavoura !== filtroLavoura) return false;
      if (filtroServico && s?.servico !== filtroServico) return false;

      // preview automático do formulário
      if (filtroPreviewLavoura && s?.lavoura !== filtroPreviewLavoura)
        return false;
      if (filtroPreviewServico && s?.servico !== filtroPreviewServico)
        return false;

      // mês/ano (corrigido para ISO completo)
      const { ano, mes } = extrairAnoMes(s?.data);
      if (filtroMes && mes !== filtroMes) return false;
      if (filtroAno && ano !== filtroAno) return false;

      // texto
      if (filtroTexto) {
        const texto = normalizar(
          `${s?.lavoura} ${s?.servico} ${s?.produto} ${s?.status}`
        );
        if (!texto.includes(normalizar(filtroTexto))) return false;
      }

      return true;
    });

    // 3) ordena depois (mais nova -> mais antiga)
    return filtrado.sort((a, b) => {
      const tb = new Date(b?.data || 0).getTime();
      const ta = new Date(a?.data || 0).getTime();

      if (tb !== ta) return tb - ta;

      // desempate estável (opcional)
      return (b?.id ?? 0) - (a?.id ?? 0);
    });
  }, [
    servicosDoContexto,
    filtroLavoura,
    filtroServico,
    filtroPreviewLavoura,
    filtroPreviewServico,
    filtroMes,
    filtroAno,
    filtroTexto,
  ]);

  // ------------------------------
  // CRUD
  // ------------------------------
  function handleSubmit(e) {
    e.preventDefault();

    if (!lavoura || !servico || !data || !status) {
      notificar("erro", "Preencha os campos obrigatórios.");
      return;
    }

    if (!usuario || !token) return;

    const existeDuplicado = (servicos || []).some((s) => {
      return (
        s?.id !== editandoId &&
        normalizar(s?.safra) === normalizar(safra) &&
        normalizar(s?.lavoura) === normalizar(lavoura) &&
        normalizar(s?.servico) === normalizar(servico) &&
        normalizar(s?.produto) === normalizar(produto)
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
      cliente_id: clienteId,
      usuario_id: usuario.id,
      // Se você tiver campo fazenda no backend, vale mandar também:
      // fazenda,
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

  // ------------------------------
  // EXPORTAÇÃO
  // ------------------------------
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

  // ------------------------------
  // RENDER (SEM mexer em CSS)
  // ------------------------------
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
              onClick={limparFiltros}
            >
              Limpar filtros
            </button>
          </header>

          <div className="filtros-grid-2">
            <div className="login-campo filtro-lavoura">
              <label className="login-label">Lavoura</label>
              <select
                className="login-input"
                value={filtroLavoura}
                onChange={(e) => setFiltroLavoura(e.target.value)}
              >
                <option value="">Todas</option>
                {opcoesLavoura.map((nome) => (
                  <option key={nome} value={nome}>
                    {nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="login-campo filtro-mes">
              <label className="login-label">Mês</label>
              <select
                className="login-input"
                value={filtroMes}
                onChange={(e) => setFiltroMes(e.target.value)}
              >
                <option value="">Todos</option>
                {opcoesMes.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
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
                {opcoesAno.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
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
                {opcoesServico.map((nome) => (
                  <option key={nome} value={nome}>
                    {nome}
                  </option>
                ))}
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
        onClick={() => {
          if (mostrarFormulario) {
            // clicou no X
            fecharFormulario(); // fecha e limpa os campos do form
            limparFiltros(); // limpa os filtros do card
          } else {
            // clicou no +
            setMostrarFormulario(true);
          }
        }}
      >
        <FontAwesomeIcon icon={mostrarFormulario ? faTimes : faPlus} />
      </button>
    </div>
  );
}

export default Realizado;
