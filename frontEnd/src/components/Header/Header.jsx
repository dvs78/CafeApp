// src/components/Header/Header.jsx
import "./Header.css";
import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleLeft,
  faHouse,
  faRightFromBracket,
  faFilter,
} from "@fortawesome/free-solid-svg-icons";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

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

  // Contexto (workspace OU localStorage)
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
    <header className="app-header" role="banner">
      <div className="app-header__inner">
        {/* ESQUERDA */}
        <div className="header-left">
          {podeVoltar ? (
            <button
              className="btn-icon"
              onClick={() => navigate(-1)}
              title="Voltar"
              aria-label="Voltar"
              type="button"
            >
              <FontAwesomeIcon icon={faAngleLeft} />
            </button>
          ) : (
            <span className="header-spacer" aria-hidden="true" />
          )}
        </div>

        {/* CENTRO */}
        <div className="header-center">
          <h1 className="header-title" title={titulo}>
            {titulo}
          </h1>

          {(estaNaHome || paginaComFiltros) && fazendaCtx ? (
            <div className="header-contexto" aria-label="Contexto atual">
              <span className="ctx-pill" title={fazendaCtx}>
                {fazendaCtx}
              </span>

              {safraCtx ? (
                <span className="ctx-pill ctx-pill--safra" title={safraCtx}>
                  {safraCtx}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* DIREITA */}
        <div className="header-right">
          {paginaComFiltros && !ocultarBotaoFiltros ? (
            <button
              className={`btn-icon ${mostrarFiltros ? "btn-icon--ativo" : ""}`}
              onClick={onToggleFiltros}
              title={mostrarFiltros ? "Ocultar filtros" : "Mostrar filtros"}
              aria-label={
                mostrarFiltros ? "Ocultar filtros" : "Mostrar filtros"
              }
              aria-pressed={!!mostrarFiltros}
              type="button"
            >
              <FontAwesomeIcon icon={faFilter} />
            </button>
          ) : (
            // Se não houver filtros, não precisa ocupar o espaço de um botão.
            // Mantém layout estável porque o grid já reserva a coluna.
            <span className="header-spacer" aria-hidden="true" />
          )}

          {estaNaHome ? (
            <button
              className="btn-icon btn-logout"
              title="Sair"
              aria-label="Sair"
              onClick={handleLogout}
              type="button"
            >
              <FontAwesomeIcon icon={faRightFromBracket} />
            </button>
          ) : (
            <button
              className="btn-icon"
              title="Início"
              aria-label="Início"
              onClick={() => navigate("/home")}
              type="button"
            >
              <FontAwesomeIcon icon={faHouse} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
