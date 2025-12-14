// src/components/Header.jsx
import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleLeft,
  faHouse,
  faRightFromBracket,
  faFilter,
} from "@fortawesome/free-solid-svg-icons";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Header({
  mostrarFiltros,
  onToggleFiltros,
  ocultarBotaoFiltros,
  tituloCustom,
  onLogout,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { workspace } = useAuth();

  const podeVoltar = location.pathname !== "/home";
  const estaEmRealizado = location.pathname === "/realizado";
  const estaNaHome = location.pathname === "/home";

  // ✅ Fonte única: workspace OU localStorage
  const clienteCtx =
    workspace?.cliente || localStorage.getItem("ctx_cliente") || "";

  const fazendaCtx =
    workspace?.fazenda || localStorage.getItem("ctx_fazenda") || "";

  const safraCtx = workspace?.safra || localStorage.getItem("ctx_safra") || "";

  // ✅ Título do Header (linha de cima)
  const titulo = useMemo(() => {
    if (tituloCustom) return tituloCustom;
    if (estaEmRealizado) return "Serviços";
    if (location.pathname === "/settings") return "Configurações";
    return clienteCtx || "CaféApp";
  }, [tituloCustom, estaEmRealizado, location.pathname, clienteCtx]);

  return (
    <header className="app-header">
      {/* ESQUERDA */}
      <div className="header-left">
        {podeVoltar ? (
          <button
            className="btn-icon"
            onClick={() => navigate(-1)}
            title="Voltar"
          >
            <FontAwesomeIcon icon={faAngleLeft} />
          </button>
        ) : (
          <span className="app-header__spacer" />
        )}
      </div>

      {/* CENTRO */}
      <div className="header-center">
        <h1 className="header-title">{titulo}</h1>

        {(estaNaHome || estaEmRealizado) && fazendaCtx && (
          <div className="header-contexto">
            <span className="header-contexto-fazenda">{fazendaCtx}</span>
            {safraCtx && (
              <span className="header-contexto-safra"> {safraCtx}</span>
            )}
          </div>
        )}
      </div>

      {/* DIREITA */}
      <div className="header-right">
        {estaEmRealizado && !ocultarBotaoFiltros ? (
          <button
            className={`btn-icon ${mostrarFiltros ? "btn-icon--ativo" : ""}`}
            onClick={onToggleFiltros}
            title="Filtros"
          >
            <FontAwesomeIcon icon={faFilter} />
          </button>
        ) : (
          <span className="app-header__spacer" />
        )}

        {estaNaHome ? (
          <button className="btn-icon" title="Sair" onClick={onLogout}>
            <FontAwesomeIcon icon={faRightFromBracket} />
          </button>
        ) : (
          <button
            className="btn-icon"
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
