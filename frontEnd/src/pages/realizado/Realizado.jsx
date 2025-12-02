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
  const data = new Date(iso);
  return data.toLocaleDateString("pt-BR"); // 05/12/2025
}

function limparQuantidade(valor) {
  if (!valor) return null;
  return valor.replace(/\./g, "").replace(",", ".");
}

// normaliza qualquer valor para comparação segura
function normalizar(v) {
  return (v ?? "").toString().trim().toLowerCase();
}

function Realizado({
  mostrarFiltros,
  setOcultarBotaoFiltros,
  setTituloCustom,
}) {
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
  const [filtroSafra, setFiltroSafra] = useState("");
  const [filtroLavoura, setFiltroLavoura] = useState("");
  const [filtroServico, setFiltroServico] = useState("");

  const temFiltrosAtivos =
    filtroMes ||
    filtroAno ||
    filtroTexto ||
    filtroTipo ||
    filtroSafra ||
    filtroLavoura;

  // ===================================================================
  // CARREGAR REALIZADO AO ABRIR
  // ===================================================================

  useEffect(() => {
    // some o botão de filtro quando o formulário estiver aberto
    setOcultarBotaoFiltros(mostrarFormulario);

    if (mostrarFormulario) {
      // se estiver editando, muda o título para "Editar serviço"
      if (editandoId) {
        setTituloCustom("Editar serviço");
      } else {
        // se for um lançamento novo
        setTituloCustom("Novo lançamento");
      }
    } else {
      // formulário fechado → volta para o título padrão "Serviços"
      setTituloCustom("");
    }
  }, [mostrarFormulario, editandoId, setOcultarBotaoFiltros, setTituloCustom]);

  useEffect(() => {
    return () => setTituloCustom(""); // cleanup ao desmontar Realizado
  }, [setTituloCustom]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const usuario = JSON.parse(localStorage.getItem("usuario") || "null");

    console.log("TOKEN LOCALSTORAGE:", token);
    console.log("USUARIO LOCALSTORAGE:", usuario);

    if (!token || !usuario) {
      console.warn("Sem token ou usuário → não buscou /realizado");
      return;
    }

    axios
      .get("/realizado", {
        headers: {
          Authorization: `Bearer ${token}`,
          "cliente-id": usuario.clienteId, // 👈 conferimos já já se é esse o nome certo
        },
      })
      .then((res) => {
        console.log("RESPOSTA /realizado:", res.data);
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
      .get("/safras")
      .then((res) => setListaSafras(res.data))
      .catch((err) => console.error("Erro ao carregar safras:", err));

    axios
      .get(`/lavouras/${clienteId}`)
      .then((res) => setListaLavouras(res.data))
      .catch((err) => console.error("Erro ao carregar lavouras:", err));

    axios
      .get("/produtos")
      .then((res) => setListaProdutos(res.data))
      .catch((err) => console.error("Erro ao carregar produtos:", err));

    axios
      .get("/servicos-lista")
      .then((res) => setListaServicos(res.data))
      .catch((err) =>
        console.error("Erro ao carregar lista de serviços:", err)
      );
  }, []);

  // ===================================================================
  // SALVAR (CRIAR / EDITAR)
  // ===================================================================
  // dentro de src/pages/realizado/Realizado.jsx

  function handleSubmit(e) {
    e.preventDefault();

    // 🔍 Validação manual usando o estado
    if (!safra || !lavoura || !servico || !data || !status) {
      notificar(
        "erro",
        "Preencha Safra, Lavoura, Serviço, Data e Status antes de lançar."
      );
      return;
    }

    // ==============================================
    // VERIFICA DUPLICIDADE
    // ==============================================
    const produtoAtualNorm = normalizar(produto);
    const safraNorm = normalizar(safra);
    const lavouraNorm = normalizar(lavoura);
    const servicoNorm = normalizar(servico);

    const existeDuplicado = servicos.some((s) => {
      const produtoExistenteNorm = normalizar(s.produto);
      return (
        s.id !== editandoId &&
        normalizar(s.safra) === safraNorm &&
        normalizar(s.lavoura) === lavouraNorm &&
        normalizar(s.servico) === servicoNorm &&
        produtoExistenteNorm === produtoAtualNorm
      );
    });

    if (existeDuplicado) {
      notificar(
        "erro",
        "Este serviço já está lançado com a mesma Safra, Lavoura, Serviço e Produto."
      );
      setConfirmDuplicado(true);
      return; // não tenta salvar no backend
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
      produto: produto || null,
      unidade: uni || null,
      quantidade: limparQuantidade(quantidade),

      cliente_id: usuario.clienteId,
      usuario_id: usuario.id,
    };

    if (!editandoId) {
      axios
        .post("/realizado", payload, {
          headers: { Authorization: `Bearer ${token}` },
        })

        .then((res) => {
          setServicos((prev) => [res.data, ...prev]);
          limparFormularioDepoisDeSalvar();
          notificar("sucesso", "Serviço lançado com sucesso!");
        })
        .catch((err) => {
          console.error("Erro ao criar serviço realizado:", err);
          notificar("erro", "Erro ao salvar serviço realizado.");
        });
    } else {
      axios
        .put(`/realizado/${editandoId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        })

        .then((res) => {
          setServicos((prev) =>
            prev.map((s) => (s.id === editandoId ? res.data : s))
          );
          limparFormularioDepoisDeSalvar();
          notificar("sucesso", "Serviço atualizado com sucesso!");
        })
        .catch((err) => {
          console.error("Erro ao atualizar serviço realizado:", err);
          notificar("erro", "Erro ao atualizar serviço realizado.");
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
      .delete(`/realizado/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      .then(() => {
        setServicos((prev) => prev.filter((s) => s.id !== id));
        notificar("sucesso", "Serviço excluído.");
      })
      .catch((err) => {
        console.error("Erro ao excluir serviço realizado:", err);
        notificar("erro", "Erro ao excluir serviço.");
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
    // setData(s.data || "");
    // converte '2025-12-01T00:00:00.000Z' → '2025-12-01'
    const dataFormatada = s.data ? s.data.split("T")[0] : "";
    setData(dataFormatada);
    setStatus(s.status || "");
    setProduto(s.produto || "");
    setUni(s.unidade || "");
    setQuantidade(String(s.quantidade ?? ""));
    setMostrarFormulario(true);
  }

  // ===================================================================
  // FILTROS MANUAIS (card) – usados sempre como base
  // ===================================================================
  const servicosComFiltrosManuais = servicos.filter((s) => {
    if (!s.data) return false;
    const [ano, mes] = s.data.split("-");

    // ➕ novos filtros
    if (filtroSafra && s.safra !== filtroSafra) return false;
    if (filtroLavoura && s.lavoura !== filtroLavoura) return false;

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
  // ESCOLHA FINAL
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
        `${formatarData(s.data)} - ${s.servico} - ${s.quantidade || ""} ${
          s.unidade || ""
        }`,
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
              <div className="filtros-linha">
                {/* SAFRA */}
                <div className="filtro-campo">
                  <div className="filtro-grupo-titulo">Safra</div>
                  <select
                    value={filtroSafra}
                    onChange={(e) => setFiltroSafra(e.target.value)}
                  >
                    <option value="">Todas</option>
                    {listaSafras.map((saf) => (
                      <option key={saf.id} value={saf.nome}>
                        {saf.nome}
                      </option>
                    ))}
                  </select>
                </div>

                {/* MÊS */}
                <div className="filtro-campo">
                  <div className="filtro-grupo-titulo">Mês</div>
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

                {/* ANO */}
                <div className="filtro-campo">
                  <div className="filtro-grupo-titulo">Ano</div>
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

              <div className="filtros-linha">
                {/* LAVOURA */}
                <div className="filtro-campo">
                  <div className="filtro-grupo-titulo">Lavoura</div>
                  <select
                    value={filtroLavoura}
                    onChange={(e) => setFiltroLavoura(e.target.value)}
                  >
                    <option value="">Todas</option>
                    {listaLavouras.map((lav) => (
                      <option key={lav.id} value={lav.nome}>
                        {lav.nome}
                      </option>
                    ))}
                  </select>
                </div>

                {/* SERVIÇOS */}
                <div className="filtro-campo">
                  <div className="filtro-grupo-titulo">Serviço</div>
                  <select
                    value={filtroServico}
                    onChange={(e) => setFiltroServico(e.target.value)}
                  >
                    <option value="">Todos</option>
                    {listaServicos.map((srv) => (
                      <option key={srv.id} value={srv.nome}>
                        {srv.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* BUSCA TEXTO */}
              <div className="filtro-grupo filtro-grupo-texto">
                <div className="filtro-grupo-titulo">
                  <FontAwesomeIcon icon={faSearch} /> Buscar texto
                </div>
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
                    setFiltroSafra("");
                    setFiltroLavoura("");
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

      <ConfirmDialog
        open={confirmDuplicado}
        title="Lançamento duplicado"
        description="Já existe um serviço lançado com esta Safra, Lavoura, Serviço e Produto."
        cancelLabel="Cancelar" // texto do único botão
        onlyCancel // 👈 mostra apenas esse botão
        onCancel={() => setConfirmDuplicado(false)}
        variant="danger"
      />

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
