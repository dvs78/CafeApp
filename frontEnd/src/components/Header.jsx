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
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { workspace, logout } = useAuth();

  const path = location.pathname;

  const estaNaHome = path === "/home";
  const estaEmRealizado = path === "/realizado";
  const estaEmChuva = path === "/chuva";
  const estaEmSettings = path === "/settings";

  const podeVoltar = !estaNaHome;

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  // Contexto
  const clienteCtx =
    workspace?.clienteNome || localStorage.getItem("ctx_cliente_nome") || "";
  const fazendaCtx =
    workspace?.fazenda || localStorage.getItem("ctx_fazenda") || "";
  const safraCtx = workspace?.safra || localStorage.getItem("ctx_safra") || "";

  // Título
  const titulo = useMemo(() => {
    if (tituloCustom) return tituloCustom;
    if (estaEmRealizado) return "Serviços";
    if (estaEmChuva) return "Chuvas";
    if (estaEmSettings) return "Configurações";
    return clienteCtx || "CaféApp";
  }, [tituloCustom, estaEmRealizado, estaEmChuva, estaEmSettings, clienteCtx]);

  // Páginas que podem ter botão de filtro
  const paginaComFiltros = estaEmRealizado || estaEmChuva;

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

        {(estaNaHome || paginaComFiltros) && fazendaCtx && (
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
        {paginaComFiltros && !ocultarBotaoFiltros ? (
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
          <button className="btn-icon" title="Sair" onClick={handleLogout}>
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
