import { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
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

  // LISTA / CONTROLES
  const [servicos, setServicos] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoId, setEditandoId] = useState(null);

  // LISTAS VINDAS DO BANCO
  const [listaSafras, setListaSafras] = useState([]);
  const [listaLavouras, setListaLavouras] = useState([]);
  const [listaProdutos, setListaProdutos] = useState([]);
  const [listaServicos, setListaServicos] = useState([]);

  // FILTROS
  const [filtroMes, setFiltroMes] = useState("");
  const [filtroAno, setFiltroAno] = useState("");
  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");

  const temFiltrosAtivos = filtroMes || filtroAno || filtroTexto || filtroTipo;

  // ===================================================================
  // CARREGAR REALIZADO AO ABRIR A TELA
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

    // SAFRAS
    axios
      .get("http://localhost:3001/safras")
      .then((res) => setListaSafras(res.data))
      .catch((err) => console.error("Erro ao carregar safras:", err));

    // LAVOURAS POR CLIENTE
    axios
      .get(`http://localhost:3001/lavouras/${clienteId}`)
      .then((res) => setListaLavouras(res.data))
      .catch((err) => console.error("Erro ao carregar lavouras:", err));

    // PRODUTOS
    axios
      .get("http://localhost:3001/produtos")
      .then((res) => setListaProdutos(res.data))
      .catch((err) => console.error("Erro ao carregar produtos:", err));

    // LISTA DE SERVIÇOS
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
      // CRIAR
      axios
        .post("http://localhost:3001/realizado", payload, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setServicos((prev) => [res.data, ...prev]);
          limparFormulario();
        })
        .catch((err) => {
          console.error("Erro ao criar serviço realizado:", err);
        });
    } else {
      // EDITAR
      axios
        .put(`http://localhost:3001/realizado/${editandoId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setServicos((prev) =>
            prev.map((s) => (s.id === editandoId ? res.data : s))
          );
          limparFormulario();
        })
        .catch((err) => {
          console.error("Erro ao atualizar serviço realizado:", err);
        });
    }
  }

  function limparFormulario() {
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
  // FILTROS NO FRONT
  // ===================================================================
  const servicosFiltrados = servicos.filter((s) => {
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
        {/* FORMULÁRIO */}
        {mostrarFormulario && (
          <section className="card card-form anima-card">
            <form onSubmit={handleSubmit} className="form-servico">
              {/* LINHA 1 – Safra + Lavoura */}
              <div className="linha-form">
                <div className="campo">
                  <label>Safra</label>
                  <select
                    value={safra}
                    onChange={(e) => setSafra(e.target.value)}
                    required
                  >
                    <option value="">Selecione a safra</option>
                    {listaSafras.map((s) => (
                      <option key={s.id} value={s.nome}>
                        {s.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="campo">
                  <label>Lavoura</label>
                  <select
                    value={lavoura}
                    onChange={(e) => setLavoura(e.target.value)}
                    required
                  >
                    <option value="">Selecione a lavoura</option>
                    {listaLavouras.map((lav) => (
                      <option key={lav.id} value={lav.nome}>
                        {lav.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* LINHA 2 – Serviço */}
              <div className="linha-form">
                <div className="campo">
                  <label>Serviço</label>
                  <select
                    value={servico}
                    onChange={(e) => setServico(e.target.value)}
                    required
                  >
                    <option value="">Selecione o serviço</option>
                    {listaServicos.map((s) => (
                      <option key={s.id} value={s.nome}>
                        {s.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* LINHA 3 – Data + Status */}
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

              {/* LINHA 4 – Produto / Unidade / Quantidade */}
              <div className="linha-form linha-form--3">
                <div className="campo">
                  <label>Produto</label>
                  <select
                    value={produto}
                    onChange={(e) => setProduto(e.target.value)}
                    required
                  >
                    <option value="">Selecione o produto</option>
                    {listaProdutos.map((p) => (
                      <option key={p.id} value={p.nome}>
                        {p.nome}
                      </option>
                    ))}
                  </select>
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

        {/* CARD DE FILTROS */}
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
                          Safra: <b>{s.safra}</b>
                        </span>
                        <span>
                          Lavoura: <b>{s.lavoura}</b>
                        </span>
                        <span>
                          Produto: <b>{s.produto}</b>
                        </span>
                        <span>
                          {s.quantidade} {s.unidade}
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

      {/* BOTÃO FLUTUANTE */}
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
