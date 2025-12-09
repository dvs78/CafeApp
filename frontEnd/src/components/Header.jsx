// src/components/Header.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  // faArrowLeft,
  faAngleLeft,
  faHouse,
  // faCircleLeft,
  faRightFromBracket,
  faFilter,
} from "@fortawesome/free-solid-svg-icons";
import { useLocation, useNavigate } from "react-router-dom";

function Header({
  usuario,
  mostrarFiltros,
  onToggleFiltros,
  ocultarBotaoFiltros,
  tituloCustom,
  onLogout,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const [clienteNome, setClienteNome] = useState("");

  const podeVoltar = location.pathname !== "/home";
  const estaEmRealizado = location.pathname === "/realizado";
  const estaNaHome = location.pathname === "/home";

  // =========================================================
  // 🔎 Busca o cliente correspondente ao clienteId do usuário
  // =========================================================
  useEffect(() => {
    if (!usuario?.clienteId) return;

    const buscarCliente = async () => {
      try {
        const res = await axios.get(`/clientes/${usuario.clienteId}`);
        // const res = await axios.get(
        //   `http://localhost:3001/clientes/${usuario.clienteId}`
        // );

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
    if (tituloCustom) return tituloCustom;
    if (estaEmRealizado) return "Serviços";
    if (location.pathname === "/settings") return "Configurações";

    // Na home (e demais), tenta usar primeiro o cliente:
    return clienteNome || "CaféApp";
  })();

  return (
    <header className="app-header">
      <div className="header-left">
        {podeVoltar && (
          <button
            className="btn-icon btn-filtros-header  "
            onClick={() => navigate(-1)}
          >
            <FontAwesomeIcon icon={faAngleLeft} />
          </button>
        )}
      </div>

      <h1 className="header-title">{titulo}</h1>

      <div className="header-right">
        {estaEmRealizado && !ocultarBotaoFiltros ? (
          <button
            className={`btn-icon btn-filtros-header ${
              mostrarFiltros ? "btn-filtros-header--ativo" : ""
            }`}
            onClick={onToggleFiltros}
            title="Mostrar filtros"
          >
            <FontAwesomeIcon icon={faFilter} />
          </button>
        ) : (
          <span className="app-header__spacer" />
        )}

        {estaNaHome ? (
          <button
            className="btn-icon btn-filtros-header "
            title="Sair"
            onClick={onLogout}
          >
            <FontAwesomeIcon icon={faRightFromBracket} />
          </button>
        ) : (
          <button
            className="btn-home btn-icon"
            title="Início"
            onClick={() => navigate("/home")}
          >
            <FontAwesomeIcon icon={faHouse} />
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;
