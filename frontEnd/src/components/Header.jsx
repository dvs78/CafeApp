// // // src/components/Header.jsx
// // import { useEffect, useState } from "react";
// // import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// // import {
// //   faAngleLeft,
// //   faHouse,
// //   faRightFromBracket,
// //   faFilter,
// // } from "@fortawesome/free-solid-svg-icons";
// // import { useLocation, useNavigate } from "react-router-dom";

// // function Header({
// //   mostrarFiltros,
// //   onToggleFiltros,
// //   ocultarBotaoFiltros,
// //   onLogout,
// // }) {
// //   const navigate = useNavigate();
// //   const location = useLocation();

// //   const [fazenda, setFazenda] = useState("");
// //   const [safra, setSafra] = useState("");

// //   const podeVoltar = location.pathname !== "/home";
// //   const estaEmRealizado = location.pathname === "/realizado";
// //   const estaNaHome = location.pathname === "/home";

// //   // 🔹 contexto vem SEMPRE do localStorage (fonte única)
// //   useEffect(() => {
// //     setFazenda(localStorage.getItem("ctx_fazenda") || "");
// //     setSafra(localStorage.getItem("ctx_safra") || "");
// //   }, [location.pathname]);

// //   return (
// //     <header className="app-header">
// //       <div className="header-left">
// //         {podeVoltar && (
// //           <button
// //             className="btn-icon"
// //             onClick={() => navigate(-1)}
// //             title="Voltar"
// //           >
// //             <FontAwesomeIcon icon={faAngleLeft} />
// //           </button>
// //         )}
// //       </div>

// //       <div className="header-center">
// //         {fazenda && (
// //           <div className="header-contexto">
// //             <span className="header-fazenda">{fazenda}</span>
// //             {safra && <span className="header-safra">Safra {safra}</span>}
// //           </div>
// //         )}
// //       </div>

// //       <div className="header-right">
// //         {estaEmRealizado && !ocultarBotaoFiltros ? (
// //           <button
// //             className={`btn-icon ${mostrarFiltros ? "ativo" : ""}`}
// //             onClick={onToggleFiltros}
// //             title="Filtros"
// //           >
// //             <FontAwesomeIcon icon={faFilter} />
// //           </button>
// //         ) : (
// //           <span className="header-spacer" />
// //         )}

// //         {estaNaHome ? (
// //           <button className="btn-icon" onClick={onLogout} title="Sair">
// //             <FontAwesomeIcon icon={faRightFromBracket} />
// //           </button>
// //         ) : (
// //           <button
// //             className="btn-icon"
// //             onClick={() => navigate("/home")}
// //             title="Início"
// //           >
// //             <FontAwesomeIcon icon={faHouse} />
// //           </button>
// //         )}
// //       </div>
// //     </header>
// //   );
// // }

// // export default Header;

// // src/components/Header.jsx
// import { useEffect, useState } from "react";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import {
//   faAngleLeft,
//   faHouse,
//   faRightFromBracket,
//   faFilter,
// } from "@fortawesome/free-solid-svg-icons";
// import { useLocation, useNavigate } from "react-router-dom";

// function Header({
//   mostrarFiltros,
//   onToggleFiltros,
//   ocultarBotaoFiltros,
//   tituloCustom,
//   onLogout,
// }) {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const [fazenda, setFazenda] = useState("");
//   const [safra, setSafra] = useState("");

//   const podeVoltar = location.pathname !== "/home";
//   const estaEmRealizado = location.pathname === "/realizado";
//   const estaNaHome = location.pathname === "/home";

//   useEffect(() => {
//     setFazenda(localStorage.getItem("ctx_fazenda") || "");
//     setSafra(localStorage.getItem("ctx_safra") || "");
//   }, [location.pathname]);

//   const titulo = tituloCustom || "";

//   return (
//     <header className="app-header">
//       <div className="header-left">
//         {podeVoltar ? (
//           <button
//             className="btn-icon"
//             onClick={() => navigate(-1)}
//             title="Voltar"
//           >
//             <FontAwesomeIcon icon={faAngleLeft} />
//           </button>
//         ) : (
//           <span className="header-spacer" />
//         )}
//       </div>

//       <div className="header-center">
//         {titulo ? <h1 className="header-title">{titulo}</h1> : null}

//         {(estaNaHome || estaEmRealizado) && fazenda ? (
//           <div className="header-contexto">
//             <span className="header-fazenda">{fazenda}</span>
//             {safra ? <span className="header-safra">Safra {safra}</span> : null}
//           </div>
//         ) : null}
//       </div>

//       <div className="header-right">
//         {estaEmRealizado && !ocultarBotaoFiltros ? (
//           <button
//             className={`btn-icon ${mostrarFiltros ? "ativo" : ""}`}
//             onClick={onToggleFiltros}
//             title="Filtros"
//           >
//             <FontAwesomeIcon icon={faFilter} />
//           </button>
//         ) : (
//           <span className="header-spacer" />
//         )}

//         {estaNaHome ? (
//           <button className="btn-icon" onClick={onLogout} title="Sair">
//             <FontAwesomeIcon icon={faRightFromBracket} />
//           </button>
//         ) : (
//           <button
//             className="btn-icon"
//             onClick={() => navigate("/home")}
//             title="Início"
//           >
//             <FontAwesomeIcon icon={faHouse} />
//           </button>
//         )}
//       </div>
//     </header>
//   );
// }

// export default Header;

// src/components/Header.jsx
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
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
  usuario,
  mostrarFiltros,
  onToggleFiltros,
  ocultarBotaoFiltros,
  tituloCustom,
  onLogout,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { workspace } = useAuth();

  const [clienteNome, setClienteNome] = useState("");

  const podeVoltar = location.pathname !== "/home";
  const estaEmRealizado = location.pathname === "/realizado";
  const estaNaHome = location.pathname === "/home";

  // Nome do cliente (título principal)
  useEffect(() => {
    if (!usuario?.clienteId) return;

    const buscarCliente = async () => {
      try {
        const res = await axios.get(`/clientes/${usuario.clienteId}`);
        const data = Array.isArray(res.data) ? res.data[0] : res.data;
        if (!data) return;

        const nome =
          data.cliente || data.nome || data.cliente_nome || data.clienteNome;

        if (nome) setClienteNome(nome);
      } catch (err) {
        console.error("Erro ao buscar nome do cliente:", err);
      }
    };

    buscarCliente();
  }, [usuario]);

  // Contexto (fazenda/safra) – usa workspace e fallback do localStorage
  const contexto = useMemo(() => {
    const fz = workspace?.fazenda || localStorage.getItem("ctx_fazenda") || "";
    const sf = workspace?.safra || localStorage.getItem("ctx_safra") || "";
    return { fazenda: fz, safra: sf };
  }, [workspace, location.pathname]);

  // Título
  const titulo = (() => {
    if (tituloCustom) return tituloCustom;
    if (estaEmRealizado) return "Serviços";
    if (location.pathname === "/settings") return "Configurações";
    return clienteNome || "CaféApp";
  })();

  return (
    <header className="app-header">
      <div className="header-left">
        {podeVoltar && (
          <button
            className="btn-icon"
            onClick={() => navigate(-1)}
            title="Voltar"
          >
            <FontAwesomeIcon icon={faAngleLeft} />
          </button>
        )}
      </div>

      <div className="header-center">
        <h1 className="header-title">{titulo}</h1>

        {(estaNaHome || estaEmRealizado) && contexto.fazenda && (
          <div className="header-contexto">
            <span className="header-contexto-fazenda">{contexto.fazenda}</span>
            {contexto.safra && (
              <span className="header-contexto-safra">
                Safra {contexto.safra}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="header-right">
        {estaEmRealizado && !ocultarBotaoFiltros ? (
          <button
            className={`btn-icon ${mostrarFiltros ? "btn-icon--ativo" : ""}`}
            onClick={onToggleFiltros}
            title="Mostrar filtros"
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
