// src/components/Header.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faFilter } from "@fortawesome/free-solid-svg-icons";
import { useLocation, useNavigate } from "react-router-dom";

function Header({ usuario, mostrarFiltros, onToggleFiltros }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [clienteNome, setClienteNome] = useState("");

  const podeVoltar = location.pathname !== "/home";
  const estaEmRealizado = location.pathname === "/realizado";

  // =========================================================
  // 🔎 Busca o cliente correspondente ao clienteId do usuário
  // =========================================================
  useEffect(() => {
    if (!usuario?.clienteId) return;

    const buscarCliente = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3001/clientes/${usuario.clienteId}`
        );

        // Pode vir como objeto OU como array de objetos
        const data = Array.isArray(res.data) ? res.data[0] : res.data;

        if (!data) return;

        // coluna da tabela: "cliente"
        const nome =
          data.cliente || data.nome || data.cliente_nome || data.clienteNome;

        if (nome) {
          setClienteNome(nome);
        }
      } catch (err) {
        console.error("Erro ao buscar nome do cliente:", err);
      }
    };

    buscarCliente();
  }, [usuario]);

  // =========================================================
  // 🧠 TÍTULO DINÂMICO
  // =========================================================
  const titulo = (() => {
    if (estaEmRealizado) return "Serviços";
    if (location.pathname === "/settings") return "Configurações";

    // Na home (e demais), tenta usar primeiro o cliente:
    return clienteNome || "CaféApp";
  })();

  return (
    <header className="app-header">
      {/* BOTÃO VOLTAR — canto esquerdo */}
      {podeVoltar && (
        <button
          className="btn-voltar"
          onClick={() => navigate(-1)}
          title="Voltar"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
      )}

      {/* TÍTULO CENTRAL */}
      <h1>{titulo}</h1>

      {/* BOTÃO FILTROS – só aparece em /realizado */}
      {estaEmRealizado ? (
        <button
          className={`btn-filtros-header ${
            mostrarFiltros ? "btn-filtros-header--ativo" : ""
          }`}
          onClick={onToggleFiltros}
          title="Mostrar filtros"
        >
          <FontAwesomeIcon icon={faFilter} />
        </button>
      ) : (
        // pra manter o alinhamento quando não tem botão
        <span className="app-header__spacer" />
      )}
    </header>
  );
}

export default Header;
