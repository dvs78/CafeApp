import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faLeaf,
  faPen,
  faTrash,
  faFileExcel,
  faFilePdf,
  faPlus,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

// FORMATA DATA
function formatarData(iso) {
  if (!iso) return "";
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

// ORDENAÇÃO
function ordenarPorDataDesc(lista) {
  return [...lista].sort((a, b) => (a.data < b.data ? 1 : -1));
}

function Realizado({ mostrarFiltros }) {
  const [servico, setServico] = useState("");
  const [data, setData] = useState("");
  const [safra, setSafra] = useState("");
  const [lavoura, setLavoura] = useState("");
  const [produto, setProduto] = useState("");
  const [uni, setUni] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [status, setStatus] = useState("");

  const [servicos, setServicos] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoId, setEditandoId] = useState(null);

  // FILTROS
  const [filtroMes, setFiltroMes] = useState("");
  const [filtroAno, setFiltroAno] = useState("");
  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");

  // CARREGAR DO LOCALSTORAGE
  useEffect(() => {
    const salvo = localStorage.getItem("servicos_cafe");
    if (salvo) setServicos(ordenarPorDataDesc(JSON.parse(salvo)));
  }, []);

  // SALVAR / EDITAR
  function handleSubmit(e) {
    e.preventDefault();

    if (!editandoId) {
      const novo = {
        id: Date.now(),
        servico,
        data,
        safra,
        lavoura,
        produto,
        uni,
        quantidade,
        status,
      };
      const novaLista = ordenarPorDataDesc([...servicos, novo]);
      setServicos(novaLista);
      localStorage.setItem("servicos_cafe", JSON.stringify(novaLista));
    } else {
      const atualizada = ordenarPorDataDesc(
        servicos.map((s) =>
          s.id === editandoId
            ? {
                ...s,
                servico,
                data,
                safra,
                lavoura,
                produto,
                uni,
                quantidade,
                status,
              }
            : s
        )
      );

      setServicos(atualizada);
      localStorage.setItem("servicos_cafe", JSON.stringify(atualizada));
    }

    setServico("");
    setData("");
    setEditandoId(null);
    setMostrarFormulario(false);
  }

  // EXCLUIR
  function handleExcluir(id) {
    const filtrada = servicos.filter((s) => s.id !== id);
    const ordenada = ordenarPorDataDesc(filtrada);
    setServicos(ordenada);
    localStorage.setItem("servicos_cafe", JSON.stringify(ordenada));
  }

  // EDITAR
  function handleEditar(item) {
    setEditandoId(item.id);
    setServico(item.servico);
    setData(item.data);
    setMostrarFormulario(true);
  }

  // FILTRO COMPLETO
  const servicosFiltrados = servicos.filter((s) => {
    if (!s.data) return false;
    const [ano, mes] = s.data.split("-");

    if (filtroMes && mes !== filtroMes) return false;
    if (filtroAno && ano !== filtroAno) return false;

    if (
      filtroTexto &&
      !s.servico.toLowerCase().includes(filtroTexto.toLowerCase())
    )
      return false;

    if (filtroTipo && filtroTipo !== "") {
      if (!s.servico.toLowerCase().includes(filtroTipo.toLowerCase()))
        return false;
    }

    return true;
  });

  // EXPORTAÇÃO EXCEL
  function exportarExcel() {
    const dados = servicosFiltrados.map((s) => ({
      Data: formatarData(s.data),
      Serviço: s.servico,
    }));

    const ws = XLSX.utils.json_to_sheet(dados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Serviços");
    XLSX.writeFile(wb, "servicos_cafe.xlsx");
  }

  // EXPORTAÇÃO PDF
  function exportarPDF() {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Serviços de Café", 10, 10);

    let y = 20;
    servicosFiltrados.forEach((s) => {
      doc.text(`${formatarData(s.data)} - ${s.servico}`, 10, y);
      y += 8;
    });

    doc.save("servicos_cafe.pdf");
  }

  const temFiltrosAtivos = filtroMes || filtroAno || filtroTexto || filtroTipo;

  return (
    <>
      <main className="app-main">
        {/* FORMULÁRIO */}
        {mostrarFormulario && (
          <section className="card card-form anima-card">
            <form onSubmit={handleSubmit} className="form-servico">
              {/* LINHA 1 – Safra + Lavoura (2 colunas) */}
              <div className="linha-form">
                <div className="campo">
                  <label>Safra</label>
                  <input
                    type="text"
                    placeholder="Ex.: 24/25"
                    value={safra}
                    onChange={(e) => setSafra(e.target.value)}
                    required
                  />
                </div>

                <div className="campo">
                  <label>Lavoura</label>
                  <input
                    type="text"
                    placeholder="Ex.: Talhão 01"
                    value={lavoura}
                    onChange={(e) => setLavoura(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* LINHA 2 – Serviço (linha inteira) */}
              <div className="linha-form">
                <div className="campo">
                  <label>Serviço</label>
                  <input
                    type="text"
                    placeholder="Roçagem, Adubação..."
                    value={servico}
                    onChange={(e) => setServico(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* LINHA 3 – Data + Status (2 colunas) */}
              <div className="linha-form">
                <div className="campo">
                  <label>Data</label>
                  <input
                    type="date"
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    required
                  />
                </div>

                <div className="campo">
                  <label>Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    required
                  >
                    <option value="">Selecione</option>
                    <option value="realizado">Realizado</option>
                    <option value="pendente">Pendente</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
              </div>

              {/* LINHA 4 – Produto / Unidade / Quantidade (3 colunas) */}
              <div className="linha-form linha-form--3">
                <div className="campo">
                  <label>Produto</label>
                  <input
                    type="text"
                    placeholder="Nome do produto"
                    value={produto}
                    onChange={(e) => setProduto(e.target.value)}
                    required
                  />
                </div>

                <div className="campo">
                  <label>Unidade</label>
                  <select
                    value={uni}
                    onChange={(e) => setUni(e.target.value)}
                    required
                  >
                    <option value="">Selecione</option>
                    <option value="L">Litro (L)</option>
                    <option value="KG">Quilo (KG)</option>
                    <option value="UN">Unidade (UN)</option>
                    <option value="SC">Saco (SC)</option>
                  </select>
                </div>

                <div className="campo">
                  <label>Quantidade</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={quantidade}
                    onChange={(e) => setQuantidade(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button className="btn-primario">
                {editandoId ? "Salvar alterações" : "Lançar serviço"}
              </button>
            </form>
          </section>
        )}

        {/* CARD ÚNICO DE FILTROS */}
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

            {/* BOTÃO LIMPAR */}
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

        {/* LISTA */}
        {!mostrarFormulario && (
          <section className="card lista-card anima-card">
            <h2>Serviços lançados</h2>

            {servicosFiltrados.length === 0 ? (
              <p>Nenhum serviço encontrado.</p>
            ) : (
              <ul className="lista-servicos">
                {servicosFiltrados.map((s) => (
                  <li key={s.id} className="servico-item">
                    <div className="servico-conteudo">
                      <span className="servico-data">
                        {formatarData(s.data)}
                      </span>
                      <span className="servico-descricao">{s.servico}</span>

                      <div className="servico-extra">
                        <span>
                          S Safra: <b>{s.safra}</b>
                        </span>
                        <span>
                          Lavoura: <b>{s.lavoura}</b>
                        </span>
                        <span>
                          Produto: <b>{s.produto}</b>
                        </span>
                        <span>
                          {s.quantidade} {s.uni}
                        </span>
                        <span>
                          Status: <b>{s.status}</b>
                        </span>
                      </div>
                    </div>

                    <div className="botoes-linha">
                      <button
                        className="btn-editar"
                        type="button"
                        onClick={() => handleEditar(s)}
                      >
                        <FontAwesomeIcon icon={faPen} /> Editar
                      </button>
                      <button
                        className="btn-excluir"
                        type="button"
                        onClick={() => handleExcluir(s.id)}
                      >
                        <FontAwesomeIcon icon={faTrash} /> Excluir
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {/* EXPORTAÇÃO */}
            {servicosFiltrados.length > 0 && (
              <div className="export-buttons">
                <button
                  className="btn-primario btn-export"
                  type="button"
                  onClick={exportarExcel}
                >
                  <FontAwesomeIcon icon={faFileExcel} /> Exportar Excel
                </button>
                <button
                  className="btn-primario btn-export"
                  type="button"
                  onClick={exportarPDF}
                >
                  <FontAwesomeIcon icon={faFilePdf} /> Exportar PDF
                </button>
              </div>
            )}
          </section>
        )}
      </main>

      {/* BOTÃO FLOAT */}
      <button
        className="fab"
        type="button"
        onClick={() => setMostrarFormulario(!mostrarFormulario)}
      >
        <FontAwesomeIcon icon={mostrarFormulario ? faTimes : faPlus} />
      </button>
    </>
  );
}

export default Realizado;
