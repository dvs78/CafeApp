import "./realizado.css";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faTimes,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";

import RealizadoForm from "./RealizadoForm";
import RealizadoLista from "./RealizadoLista";
import ConfirmDialog from "../../components/ConfirmDialog/ConfirmDialog";
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
  if (valor === null || valor === undefined || valor === "") return null;
  const txt = valor.toString().replace(/\./g, "").replace(",", ".");
  const num = Number(txt);
  return Number.isNaN(num) ? null : num;
}

function normalizar(v) {
  return (v ?? "").toString().trim().toLowerCase();
}

function formatarQuantidadeParaInput(valor) {
  if (valor === null || valor === undefined || valor === "") return "";
  const n = Number(valor);
  if (Number.isNaN(n)) return "";
  return n
    .toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    .replace(/\./g, "");
}

function extrairAnoMes(dataISO) {
  if (!dataISO) return { ano: "", mes: "" };
  const d = new Date(dataISO);
  if (Number.isNaN(d.getTime())) return { ano: "", mes: "" };
  return {
    ano: String(d.getFullYear()),
    mes: String(d.getMonth() + 1).padStart(2, "0"),
  };
}

function Realizado({
  mostrarFiltros,
  setOcultarBotaoFiltros,
  setTituloCustom,
}) {
  const navigate = useNavigate();
  const { token, usuario, workspace } = useAuth();

  const [confirmExcluir, setConfirmExcluir] = useState(false);
  const [servicoParaExcluir, setServicoParaExcluir] = useState(null);

  // ------------------------------
  // CONTEXTO (Cliente/Fazenda/Safra)
  // ------------------------------
  const clienteId =
    workspace?.clienteId || localStorage.getItem("ctx_cliente_id") || "";

  const fazendaId =
    workspace?.fazendaId || localStorage.getItem("ctx_fazenda_id") || "";

  const safraId =
    workspace?.safraId || localStorage.getItem("ctx_safra_id") || "";

  const safraNome = workspace?.safra || localStorage.getItem("ctx_safra") || "";

  // persistência extra
  useEffect(() => {
    if (workspace?.clienteId)
      localStorage.setItem("ctx_cliente_id", workspace.clienteId);
    if (workspace?.clienteNome)
      localStorage.setItem("ctx_cliente_nome", workspace.clienteNome);

    if (workspace?.fazendaId)
      localStorage.setItem("ctx_fazenda_id", workspace.fazendaId);
    if (workspace?.fazenda)
      localStorage.setItem("ctx_fazenda", workspace.fazenda);

    if (workspace?.safra) localStorage.setItem("ctx_safra", workspace.safra);
    if (workspace?.safraId)
      localStorage.setItem("ctx_safra_id", workspace.safraId);
  }, [workspace]);

  // validações de navegação
  useEffect(() => {
    if (!clienteId) {
      notificar("erro", "Cliente não selecionado. Retorne ao início.");
      navigate("/poslogin");
    }
  }, [clienteId, navigate]);

  useEffect(() => {
    if (!usuario || !token) {
      navigate("/login");
      return;
    }
    if (!clienteId || !fazendaId || !safraId) {
      notificar("erro", "Selecione Cliente, Fazenda e Safra para continuar.");
      navigate("/poslogin");
    }
  }, [usuario, token, clienteId, fazendaId, safraId, navigate]);

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

  // duplicação
  const [modoDuplicar, setModoDuplicar] = useState(false);
  const [lavouraOriginalDuplicacao, setLavouraOriginalDuplicacao] =
    useState("");

  // ------------------------------
  // LISTAS
  // ------------------------------
  const [servicosState, setServicosState] = useState([]);
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

  function limparFiltros() {
    setFiltroMes("");
    setFiltroAno("");
    setFiltroTexto("");
    setFiltroLavoura("");
    setFiltroServico("");
  }

  // ------------------------------
  // HEADER
  // ------------------------------
  useEffect(() => {
    setOcultarBotaoFiltros?.(mostrarFormulario);
    setTituloCustom?.("Serviços");
    return () => setTituloCustom?.("");
  }, [mostrarFormulario, setOcultarBotaoFiltros, setTituloCustom]);

  // ------------------------------
  // CARREGAR DADOS (Realizado)
  // ------------------------------
  useEffect(() => {
    if (!token || !usuario || !clienteId || !fazendaId || !safraId) return;

    api
      .get("/realizado", {
        params: {
          cliente_id: clienteId,
          fazenda_id: fazendaId,
          safra_id: safraId,
        },
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setServicosState(Array.isArray(res.data) ? res.data : []))
      .catch((err) => {
        console.log(
          "ERRO GET /realizado:",
          err?.response?.data || err?.message
        );
        notificar("erro", "Erro ao carregar serviços.");
      });
  }, [token, usuario, clienteId, fazendaId, safraId]);

  // ao trocar contexto, limpa lista e filtros
  useEffect(() => {
    setServicosState([]);
    limparFiltros();
  }, [clienteId, fazendaId, safraId]);

  // ------------------------------
  // CARREGAR LISTAS AUXILIARES
  // ------------------------------
  useEffect(() => {
    if (!usuario || !clienteId || !token) return;

    Promise.all([
      api.get(`/lavouras/${clienteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      api.get("/produtos", {
        headers: { Authorization: `Bearer ${token}` },
      }),
      api.get("/servicos-lista", {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ])
      .then(([l, p, s]) => {
        setListaLavouras(Array.isArray(l.data) ? l.data : []);
        // se vier ativo/inativo, você pode filtrar ativos aqui se quiser:
        setListaProdutos(Array.isArray(p.data) ? p.data : []);
        setListaServicos(Array.isArray(s.data) ? s.data : []);
      })
      .catch((err) => {
        console.log("ERRO ao carregar listas:", {
          message: err?.message,
          status: err?.response?.status,
          data: err?.response?.data,
          url: err?.config?.url,
        });
        notificar("erro", "Erro ao carregar listas.");
      });
  }, [usuario, clienteId, token]);

  const lavourasDaFazenda = useMemo(() => {
    if (!fazendaId) return listaLavouras;
    return (listaLavouras || []).filter(
      (l) => String(l?.fazenda_id) === String(fazendaId)
    );
  }, [listaLavouras, fazendaId]);

  // ------------------------------
  // BASE DO CONTEXTO
  // ------------------------------
  const servicosDoContexto = useMemo(() => {
    const lista = Array.isArray(servicosState) ? servicosState : [];

    return lista.filter((s) => {
      if (safraId && String(s?.safra_id) !== String(safraId)) return false;

      const cid = s?.cliente_id ?? s?.clienteId ?? s?.cliente;
      if (cid && String(cid) !== String(clienteId)) return false;

      const fid = s?.fazenda_id ?? s?.fazendaId;
      if (fazendaId && String(fid) !== String(fazendaId)) return false;

      return true;
    });
  }, [servicosState, safraId, clienteId, fazendaId]);

  // ------------------------------
  // OPÇÕES DOS SELECTS
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
    const nomes = (lavourasDaFazenda || []).map((l) => l?.nome).filter(Boolean);
    return [...new Set(nomes)].sort((a, b) => a.localeCompare(b));
  }, [lavourasDaFazenda]);

  const opcoesServico = useMemo(() => {
    const set = new Set();
    servicosDoContexto.forEach((s) => s?.servico && set.add(s.servico));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [servicosDoContexto]);

  const filtroPreviewLavoura = mostrarFormulario ? lavoura : "";
  const filtroPreviewServico = mostrarFormulario ? servico : "";

  // ------------------------------
  // FILTRAGEM + ORDENAÇÃO
  // ------------------------------
  const servicosFiltrados = useMemo(() => {
    const base = Array.isArray(servicosDoContexto) ? servicosDoContexto : [];

    const filtrado = base.filter((s) => {
      if (filtroLavoura && s?.lavoura !== filtroLavoura) return false;
      if (filtroServico && s?.servico !== filtroServico) return false;

      if (filtroPreviewLavoura && s?.lavoura !== filtroPreviewLavoura)
        return false;
      if (filtroPreviewServico && s?.servico !== filtroPreviewServico)
        return false;

      const { ano, mes } = extrairAnoMes(s?.data);
      if (filtroMes && mes !== filtroMes) return false;
      if (filtroAno && ano !== filtroAno) return false;

      if (filtroTexto) {
        const texto = normalizar(
          `${s?.lavoura} ${s?.servico} ${s?.produto} ${s?.status}`
        );
        if (!texto.includes(normalizar(filtroTexto))) return false;
      }

      return true;
    });

    return filtrado.sort((a, b) => {
      const tb = new Date(b?.data || 0).getTime();
      const ta = new Date(a?.data || 0).getTime();
      if (tb !== ta) return tb - ta;

      const ib = String(b?.id || "");
      const ia = String(a?.id || "");
      return ib < ia ? 1 : ib > ia ? -1 : 0;
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

    if (!clienteId || !fazendaId || !safraId) {
      notificar(
        "erro",
        "Contexto inválido. Retorne e selecione Cliente, Fazenda e Safra novamente."
      );
      navigate("/poslogin");
      return;
    }

    if (!lavoura || !servico || !data || !status) {
      notificar("erro", "Preencha os campos obrigatórios.");
      return;
    }

    if (modoDuplicar) {
      if (normalizar(lavoura) === normalizar(lavouraOriginalDuplicacao)) {
        notificar(
          "erro",
          "Ao copiar um item, você precisa alterar a Lavoura para salvar o novo lançamento."
        );
        return;
      }
    }

    if (!usuario || !token) return;

    const existeDuplicado = (servicosState || []).some((s) => {
      return (
        s?.id !== editandoId &&
        String(s?.cliente_id) === String(clienteId) &&
        String(s?.fazenda_id) === String(fazendaId) &&
        String(s?.safra_id) === String(safraId) &&
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
      safra_id: safraId,
      lavoura,
      servico,
      data,
      status,
      produto: produto || null,
      unidade: uni || null,
      quantidade: limparQuantidade(quantidade),
      cliente_id: clienteId,
      fazenda_id: fazendaId,
      usuario_id: usuario.id,
    };

    const config = { headers: { Authorization: `Bearer ${token}` } };

    const req = editandoId
      ? api.put(`/realizado/${editandoId}`, payload, config)
      : api.post("/realizado", payload, config);

    req
      .then((res) => {
        if (editandoId) {
          setServicosState((prev) =>
            prev.map((s) => (s.id === editandoId ? res.data : s))
          );
          notificar("sucesso", "Serviço atualizado.");
        } else {
          setServicosState((prev) => [res.data, ...prev]);
          notificar("sucesso", "Serviço lançado.");
        }
        fecharFormulario();
      })
      .catch((err) => {
        const msg =
          err?.response?.data?.erro ||
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Erro ao salvar.";
        notificar("erro", msg);
      });
  }

  function handleEditar(s) {
    setModoDuplicar(false);
    setLavouraOriginalDuplicacao("");

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

  function handleDuplicar(s) {
    setEditandoId(null);
    setModoDuplicar(true);
    setLavouraOriginalDuplicacao(s.lavoura || "");

    setLavoura("");
    setServico(s.servico || "");
    setData(s.data ? s.data.split("T")[0] : "");
    setStatus(s.status || "");

    setProduto("");
    setUni("");
    setQuantidade("");

    setMostrarFormulario(true);
  }

  function pedirExcluir(item) {
    setServicoParaExcluir(item);
    setConfirmExcluir(true);
  }

  function confirmarExcluir() {
    if (!token || !servicoParaExcluir?.id) return;

    api
      .delete(`/realizado/${servicoParaExcluir.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setServicosState((prev) =>
          prev.filter((s) => s.id !== servicoParaExcluir.id)
        );
        notificar("sucesso", "Serviço excluído.");
      })
      .catch((err) => {
        console.log(
          "ERRO delete /realizado:",
          err?.response?.data || err?.message
        );
        notificar("erro", "Erro ao excluir serviço.");
      })
      .finally(() => {
        setConfirmExcluir(false);
        setServicoParaExcluir(null);
      });
  }

  function fecharFormulario() {
    setMostrarFormulario(false);
    setEditandoId(null);

    setModoDuplicar(false);
    setLavouraOriginalDuplicacao("");

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
    doc.text(`Serviços - ${safraNome || ""}`, 10, 10);
    let y = 20;

    servicosFiltrados.forEach((s) => {
      doc.text(
        `${formatarData(s.data)} - ${s.servico} - ${s.quantidade ?? ""}`,
        10,
        y
      );
      y += 8;
    });

    doc.save("servicos.pdf");
  }

  // ------------------------------
  // RENDER
  // ------------------------------
  return (
    <div className="realizado-page">
      {mostrarFormulario && (
        <RealizadoForm
          onSubmit={handleSubmit}
          editandoId={editandoId}
          modoDuplicar={modoDuplicar}
          lavouraOriginalDuplicacao={lavouraOriginalDuplicacao}
          safra={safraNome}
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
          listaLavouras={lavourasDaFazenda}
          listaProdutos={listaProdutos}
          listaServicos={listaServicos}
          onCancelar={fecharFormulario}
        />
      )}

      {!mostrarFormulario && mostrarFiltros && (
        <section className="card filtros-card anima-card">
          <header className="filtros-topo">
            <h2 className="filtros-title">Filtros</h2>

            {/* <button
              className="btn-secondary"
              type="button"
              onClick={limparFiltros}
            >
              Limpar campos
            </button> */}
          </header>

          <div className="filtros-grid-4">
            {/* Lavoura */}
            <div className="form-field">
              <label>Lavoura</label>
              <div className="form-select-wrapper">
                <select
                  className="form-control"
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
                <FontAwesomeIcon icon={faChevronDown} className="select-icon" />
              </div>
            </div>

            {/* Serviço */}
            <div className="form-field">
              <label>Serviço</label>
              <div className="form-select-wrapper">
                <select
                  className="form-control"
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
                <FontAwesomeIcon icon={faChevronDown} className="select-icon" />
              </div>
            </div>

            {/* Ano (menor) */}
            <div className="form-field filtro-pequeno">
              <label>Ano</label>
              <div className="form-select-wrapper">
                <select
                  className="form-control"
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
                <FontAwesomeIcon icon={faChevronDown} className="select-icon" />
              </div>
            </div>

            {/* Mês (menor) */}
            <div className="form-field filtro-pequeno">
              <label>Mês</label>
              <div className="form-select-wrapper">
                <select
                  className="form-control"
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
                <FontAwesomeIcon icon={faChevronDown} className="select-icon" />
              </div>
            </div>

            {/* Buscar texto + Limpar campos */}
            <div className="form-field filtro-busca-com-botao">
              <label>Buscar texto</label>

              <div className="filtro-busca-row">
                <input
                  className="form-control"
                  placeholder="Ex.: adubação, roçagem..."
                  value={filtroTexto}
                  onChange={(e) => setFiltroTexto(e.target.value)}
                />

                <button
                  type="button"
                  className="btn-secondary btn-limpar-inline"
                  onClick={limparFiltros}
                >
                  Limpar campos
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      <RealizadoLista
        servicosFiltrados={servicosFiltrados}
        onEditar={handleEditar}
        onDuplicar={handleDuplicar}
        onExcluir={pedirExcluir}
        onExportarExcel={exportarExcel}
        onExportarPDF={exportarPDF}
      />

      <ConfirmDialog
        open={confirmExcluir}
        title="Excluir serviço?"
        description={
          servicoParaExcluir
            ? `Lavoura: ${servicoParaExcluir.lavoura}
Serviço: ${servicoParaExcluir.servico}

Essa ação não pode ser desfeita.`
            : "Essa ação não pode ser desfeita."
        }
        cancelLabel="Cancelar"
        confirmLabel="Excluir"
        onCancel={() => {
          setConfirmExcluir(false);
          setServicoParaExcluir(null);
        }}
        onConfirm={confirmarExcluir}
        variant="danger"
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
            fecharFormulario();
            limparFiltros();
          } else {
            setMostrarFormulario(true);
          }
        }}
        title={mostrarFormulario ? "Fechar" : "Novo lançamento"}
      >
        <FontAwesomeIcon icon={mostrarFormulario ? faTimes : faPlus} />
      </button>
    </div>
  );
}

export default Realizado;
