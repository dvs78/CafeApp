// src/pages/realizado/Realizado.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faFileExcel,
  faFilePdf,
  faPlus,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

import RealizadoForm from "./RealizadoForm";
import RealizadoLista from "./RealizadoLista";
import ConfirmDialog from "../../components/ConfirmDialog";
import { notificar } from "../../components/Toast";

// FORMATA DATA
function formatarData(iso) {
  if (!iso) return "";
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

function Realizado({ mostrarFiltros }) {
  // CAMPOS DO FORM
  const [safra, setSafra] = useState("");
  const [lavoura, setLavoura] = useState("");
  const [servico, setServico] = useState("");
  const [data, setData] = useState("");
  const [status, setStatus] = useState("");
  const [produto, setProduto] = useState("");
  const [uni, setUni] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [confirmDuplicado, setConfirmDuplicado] = useState(false);

  // LISTA / CONTROLES
  const [servicos, setServicos] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoId, setEditandoId] = useState(null);

  // LISTAS VINDAS DO BANCO
  const [listaSafras, setListaSafras] = useState([]);
  const [listaLavouras, setListaLavouras] = useState([]);
  const [listaProdutos, setListaProdutos] = useState([]);
  const [listaServicos, setListaServicos] = useState([]);

  // FILTROS MANUAIS (card de filtros)
  const [filtroMes, setFiltroMes] = useState("");
  const [filtroAno, setFiltroAno] = useState("");
  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");

  const temFiltrosAtivos = filtroMes || filtroAno || filtroTexto || filtroTipo;

  // ===================================================================
  // CARREGAR REALIZADO AO ABRIR
  // ===================================================================
  useEffect(() => {
    const token = localStorage.getItem("token");
    const usuario = JSON.parse(localStorage.getItem("usuario") || "null");

    if (!token || !usuario) return;

    axios
      .get("http://localhost:3001/realizado", {
        headers: {
          Authorization: `Bearer ${token}`,
          "cliente-id": usuario.clienteId,
        },
      })
      .then((res) => {
        setServicos(res.data);
      })
      .catch((err) => {
        console.error("Erro ao carregar serviços realizados:", err);
      });
  }, []);

  // ===================================================================
  // CARREGAR LISTAS (SAFRAS, LAVOURAS, PRODUTOS, SERVIÇOS)
  // ===================================================================
  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem("usuario") || "null");
    if (!usuario) return;

    const clienteId = usuario.clienteId;

    axios
      .get("http://localhost:3001/safras")
      .then((res) => setListaSafras(res.data))
      .catch((err) => console.error("Erro ao carregar safras:", err));

    axios
      .get(`http://localhost:3001/lavouras/${clienteId}`)
      .then((res) => setListaLavouras(res.data))
      .catch((err) => console.error("Erro ao carregar lavouras:", err));

    axios
      .get("http://localhost:3001/produtos")
      .then((res) => setListaProdutos(res.data))
      .catch((err) => console.error("Erro ao carregar produtos:", err));

    axios
      .get("http://localhost:3001/servicos-lista")
      .then((res) => setListaServicos(res.data))
      .catch((err) =>
        console.error("Erro ao carregar lista de serviços:", err)
      );
  }, []);

  // ===================================================================
  // SALVAR (CRIAR / EDITAR)
  // ===================================================================
  function handleSubmit(e) {
    e.preventDefault();

    // ==============================================
    // VERIFICA DUPLICIDADE (Safra + Lavoura + Serviço + Produto)
    // ==============================================
    const existeDuplicado = servicos.some((s) => {
      return (
        s.safra === safra &&
        s.lavoura === lavoura &&
        s.servico === servico &&
        s.produto === produto &&
        s.id !== editandoId // permite editar o atual
      );
    });

    if (existeDuplicado) {
      alert(
        "Este serviço já foi lançado com a mesma safra, lavoura, serviço e produto."
      );
      return;
    }

    const token = localStorage.getItem("token");
    const usuario = JSON.parse(localStorage.getItem("usuario") || "null");

    if (!token || !usuario) {
      alert("Sessão expirada. Faça login novamente.");
      return;
    }

    const payload = {
      safra,
      lavoura,
      servico,
      data,
      status,
      produto,
      unidade: uni,
      quantidade,
      cliente_id: usuario.clienteId,
      usuario_id: usuario.id,
    };

    if (!editandoId) {
      axios
        .post("http://localhost:3001/realizado", payload, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setServicos((prev) => [res.data, ...prev]);
          limparFormularioDepoisDeSalvar();
        })
        .catch((err) => {
          console.error("Erro ao criar serviço realizado:", err);
        });
    } else {
      axios
        .put(`http://localhost:3001/realizado/${editandoId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setServicos((prev) =>
            prev.map((s) => (s.id === editandoId ? res.data : s))
          );
          limparFormularioDepoisDeSalvar();
        })
        .catch((err) => {
          console.error("Erro ao atualizar serviço realizado:", err);
        });
    }
  }

  // Limpa campos "rápidos", mantendo safra/lavoura/servico
  function limparFormularioDepoisDeSalvar() {
    setData("");
    setStatus("");
    setProduto("");
    setUni("");
    setQuantidade("");
    setEditandoId(null);
  }

  // Limpa tudo e fecha o formulário (usado ao clicar no X do botão flutuante)
  function fecharFormulario() {
    setSafra("");
    setLavoura("");
    setServico("");
    setData("");
    setStatus("");
    setProduto("");
    setUni("");
    setQuantidade("");
    setEditandoId(null);
    setMostrarFormulario(false);
  }

  // ===================================================================
  // EXCLUIR
  // ===================================================================
  function handleExcluir(id) {
    const token = localStorage.getItem("token");
    if (!token) return;

    axios
      .delete(`http://localhost:3001/realizado/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setServicos((prev) => prev.filter((s) => s.id !== id));
      })
      .catch((err) => {
        console.error("Erro ao excluir serviço realizado:", err);
      });
  }

  // ===================================================================
  // EDITAR
  // ===================================================================
  function handleEditar(s) {
    setEditandoId(s.id);
    setSafra(s.safra || "");
    setLavoura(s.lavoura || "");
    setServico(s.servico || "");
    setData(s.data || "");
    setStatus(s.status || "");
    setProduto(s.produto || "");
    setUni(s.unidade || "");
    setQuantidade(String(s.quantidade ?? ""));
    setMostrarFormulario(true);
  }

  // ===================================================================
  // FILTRO AUTOMÁTICO PELO QUE ESTÁ NO FORM (quando aberto)
  // ===================================================================
  const filtroAutomatico = servicos.filter((s) => {
    if (safra && s.safra !== safra) return false;
    if (lavoura && s.lavoura !== lavoura) return false;
    if (servico && s.servico !== servico) return false;
    return true;
  });

  // ===================================================================
  // FILTROS MANUAIS (card) – usados sempre como base
  // ===================================================================
  const servicosComFiltrosManuais = servicos.filter((s) => {
    if (!s.data) return false;
    const [ano, mes] = s.data.split("-");

    if (filtroMes && mes !== filtroMes) return false;
    if (filtroAno && ano !== filtroAno) return false;

    if (
      filtroTexto &&
      !s.servico?.toLowerCase().includes(filtroTexto.toLowerCase())
    )
      return false;

    if (filtroTipo && filtroTipo !== "") {
      if (!s.servico?.toLowerCase().includes(filtroTipo.toLowerCase()))
        return false;
    }

    return true;
  });

  // ===================================================================
  // ESCOLHA FINAL:
  // Se o formulário estiver aberto E tiver safra/lavoura/serviço,
  // aplica o filtro automático em cima da lista já filtrada pelos filtros manuais.
  // Senão, usa só os filtros manuais.
  // ===================================================================
  const servicosFiltrados =
    mostrarFormulario && (safra || lavoura || servico)
      ? servicosComFiltrosManuais.filter((s) => {
          if (safra && s.safra !== safra) return false;
          if (lavoura && s.lavoura !== lavoura) return false;
          if (servico && s.servico !== servico) return false;
          return true;
        })
      : servicosComFiltrosManuais;

  // ===================================================================
  // EXPORTAÇÕES
  // ===================================================================
  function exportarExcel() {
    const dados = servicosFiltrados.map((s) => ({
      Data: formatarData(s.data),
      Safra: s.safra,
      Lavoura: s.lavoura,
      Serviço: s.servico,
      Produto: s.produto,
      Quantidade: s.quantidade,
      Unidade: s.unidade,
      Status: s.status,
    }));

    const ws = XLSX.utils.json_to_sheet(dados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Serviços");
    XLSX.writeFile(wb, "servicos_cafe.xlsx");
  }

  function exportarPDF() {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Serviços de Café", 10, 10);

    let y = 20;
    servicosFiltrados.forEach((s) => {
      doc.text(
        `${formatarData(s.data)} - ${s.servico} - ${s.quantidade} ${s.unidade}`,
        10,
        y
      );
      y += 8;
    });

    doc.save("servicos_cafe.pdf");
  }

  // ===================================================================
  // RENDER
  // ===================================================================
  return (
    <>
      <main className="app-main">
        {/* FORMULÁRIO – aparece só quando mostrarFormulario = true */}
        {mostrarFormulario && (
          <RealizadoForm
            onSubmit={handleSubmit}
            editandoId={editandoId}
            safra={safra}
            setSafra={setSafra}
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
            listaSafras={listaSafras}
            listaLavouras={listaLavouras}
            listaProdutos={listaProdutos}
            listaServicos={listaServicos}
          />
        )}

        {/* CARD DE FILTROS – só aparece quando o formulário está fechado e o header mandou mostrarFiltros=true */}
        {!mostrarFormulario && mostrarFiltros && (
          <section className="card filtros-card anima-card">
            <div className="filtros-header">
              <h2>Filtros</h2>
            </div>

            <div className="filtros-grid">
              {/* PERÍODO */}
              <div className="filtro-grupo">
                <div className="filtros-linha">
                  <div className="filtro-campo">
                    <label>Mês</label>
                    <select
                      value={filtroMes}
                      onChange={(e) => setFiltroMes(e.target.value)}
                    >
                      <option value="">Todos</option>
                      <option value="01">Janeiro</option>
                      <option value="02">Fevereiro</option>
                      <option value="03">Março</option>
                      <option value="04">Abril</option>
                      <option value="05">Maio</option>
                      <option value="06">Junho</option>
                      <option value="07">Julho</option>
                      <option value="08">Agosto</option>
                      <option value="09">Setembro</option>
                      <option value="10">Outubro</option>
                      <option value="11">Novembro</option>
                      <option value="12">Dezembro</option>
                    </select>
                  </div>

                  <div className="filtro-campo">
                    <label>Ano</label>
                    <select
                      value={filtroAno}
                      onChange={(e) => setFiltroAno(e.target.value)}
                    >
                      <option value="">Todos</option>
                      <option value="2024">2024</option>
                      <option value="2025">2025</option>
                      <option value="2026">2026</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* TIPO */}
              <div className="filtro-grupo">
                <span className="filtro-grupo-titulo">Tipo de serviço</span>
                <select
                  value={filtroTipo}
                  onChange={(e) => setFiltroTipo(e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="roç">Roçagem</option>
                  <option value="adub">Adubação</option>
                  <option value="pulf">Pulverização</option>
                  <option value="colh">Colheita</option>
                </select>
              </div>

              {/* TEXTO */}
              <div className="filtro-grupo filtro-grupo-texto">
                <span className="filtro-grupo-titulo">
                  <FontAwesomeIcon icon={faSearch} /> Buscar texto
                </span>
                <input
                  className="input-busca"
                  type="text"
                  placeholder="Ex.: adubação, roçagem..."
                  value={filtroTexto}
                  onChange={(e) => setFiltroTexto(e.target.value)}
                />
              </div>
            </div>

            {temFiltrosAtivos && (
              <div className="filtros-acoes">
                <button
                  className="btn-limpar-filtros"
                  type="button"
                  onClick={() => {
                    setFiltroMes("");
                    setFiltroAno("");
                    setFiltroTexto("");
                    setFiltroTipo("");
                  }}
                >
                  Limpar filtros
                </button>
              </div>
            )}
          </section>
        )}

        {/* LISTA – sempre visível */}
        <RealizadoLista
          servicosFiltrados={servicosFiltrados}
          onEditar={handleEditar}
          onExcluir={handleExcluir}
          onExportarExcel={exportarExcel}
          onExportarPDF={exportarPDF}
        />
      </main>

      {/* BOTÃO FLUTUANTE – abre/fecha o formulário */}
      <button
        className="fab"
        type="button"
        onClick={() => {
          if (mostrarFormulario) {
            fecharFormulario();
          } else {
            setMostrarFormulario(true);
          }
        }}
      >
        <FontAwesomeIcon icon={mostrarFormulario ? faTimes : faPlus} />
      </button>
    </>
  );
}

export default Realizado;
