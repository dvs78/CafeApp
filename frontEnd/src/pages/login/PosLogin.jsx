// // src/pages/login/PosLogin.jsx
// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../../context/AuthContext";
// import axios from "axios";
// import "./PosLogin.css";
// import { toast } from "react-toastify";

// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";

// const TOAST_SELECIONE_CTX = "toast-selecione-fazenda-safra";
// const TOAST_ERRO_CARREGAR = "toast-erro-carregar-poslogin";

// function PosLogin() {
//   const { usuario, logout, setWorkspace } = useAuth();
//   const navigate = useNavigate();

//   const [fazendas, setFazendas] = useState([]);
//   const [safras, setSafras] = useState([]);

//   const [fazenda, setFazenda] = useState("");
//   const [safra, setSafra] = useState("");

//   function handleLogout() {
//     logout();
//     navigate("/login");
//   }

//   useEffect(() => {
//     if (!usuario) return;

//     async function carregar() {
//       try {
//         const fz = await axios.get(`/fazendas-usuario/${usuario.id}`);
//         const sf = await axios.get(`/safras-lista`);

//         setFazendas(fz.data || []);
//         setSafras(sf.data || []);

//         if (fz.data?.length === 1) setFazenda(fz.data[0].fazenda);
//         if (sf.data?.length === 1) setSafra(sf.data[0].nome);
//       } catch (err) {
//         console.error(err);
//         if (!toast.isActive(TOAST_ERRO_CARREGAR)) {
//           toast.error("Erro ao carregar dados do PosLogin.", {
//             toastId: TOAST_ERRO_CARREGAR,
//           });
//         }
//       }
//     }

//     carregar();
//   }, [usuario]);

//   function continuar() {
//     if (!fazenda || !safra) {
//       if (!toast.isActive(TOAST_SELECIONE_CTX)) {
//         toast.info("Selecione fazenda e safra para continuar.", {
//           toastId: TOAST_SELECIONE_CTX,
//         });
//       }
//       return;
//     }

//     // salva no Context
//     setWorkspace({ fazenda, safra });

//     // salva também no localStorage (pra não perder ao dar F5)
//     localStorage.setItem("ctx_fazenda", fazenda);
//     localStorage.setItem("ctx_safra", safra);

//     navigate("/home");
//   }

//   return (
//     <div className="poslogin-wrapper">
//       <button className="logout-btn" onClick={handleLogout} title="Sair">
//         <FontAwesomeIcon icon={faRightFromBracket} />
//       </button>

//       <div className="poslogin-card">
//         <h2 className="titulo-ola">Olá, {usuario?.nome || "Usuário"}</h2>
//         <p className="subtitulo">
//           Escolha seu ambiente de trabalho para continuar.
//         </p>

//         <div className="step-title">
//           <div className="step-number">1</div>
//           <span>Selecione a Fazenda</span>
//         </div>

//         <div className="fazendas-grid">
//           {fazendas.map((f) => {
//             const nomeFazenda = f.fazenda;
//             const ativo = fazenda === nomeFazenda;

//             return (
//               <button
//                 key={f.id}
//                 type="button"
//                 className={`fazenda-card ${ativo ? "ativo" : ""}`}
//                 onClick={() => setFazenda(nomeFazenda)}
//               >
//                 <span className="card-title">{nomeFazenda}</span>
//               </button>
//             );
//           })}
//         </div>

//         <div className="divider" />

//         <div className="step-title">
//           <div className="step-number">2</div>
//           <span>Selecione a Safra</span>
//         </div>

//         <div className="safras-grid">
//           {safras.map((s) => {
//             const nomeSafra = s.nome;
//             const ativo = safra === nomeSafra;

//             return (
//               <button
//                 key={s.id}
//                 type="button"
//                 className={`safra-card ${ativo ? "ativo" : ""}`}
//                 onClick={() => setSafra(nomeSafra)}
//               >
//                 <span className="select-value">{nomeSafra}</span>
//               </button>
//             );
//           })}
//         </div>

//         <button className="btn-continuar" onClick={continuar}>
//           Continuar
//         </button>
//       </div>
//     </div>
//   );
// }

// export default PosLogin;

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import "./PosLogin.css";
import { toast } from "react-toastify";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";

const TOAST_SELECIONE_CTX = "toast-selecione-fazenda-safra";
const TOAST_ERRO_CARREGAR = "toast-erro-carregar-poslogin";

function PosLogin() {
  const { usuario, logout, setWorkspace } = useAuth();
  const navigate = useNavigate();

  const [fazendas, setFazendas] = useState([]);
  const [safras, setSafras] = useState([]);

  const [fazenda, setFazenda] = useState(
    () => localStorage.getItem("ctx_fazenda") || ""
  );
  const [safra, setSafra] = useState(
    () => localStorage.getItem("ctx_safra") || ""
  );

  const podeContinuar = useMemo(() => !!fazenda && !!safra, [fazenda, safra]);

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  useEffect(() => {
    if (!usuario?.id) return;

    async function carregar() {
      try {
        const [fz, sf] = await Promise.all([
          axios.get(`/fazendas-usuario/${usuario.id}`),
          axios.get(`/safras-lista`),
        ]);

        const listaFazendas = fz.data || [];
        const listaSafras = sf.data || [];

        setFazendas(listaFazendas);
        setSafras(listaSafras);

        // auto-seleciona se vier só 1
        if (!fazenda && listaFazendas.length === 1)
          setFazenda(listaFazendas[0].fazenda);
        if (!safra && listaSafras.length === 1) setSafra(listaSafras[0].nome);
      } catch (err) {
        console.error(err);
        if (!toast.isActive(TOAST_ERRO_CARREGAR)) {
          toast.error("Erro ao carregar dados do PosLogin.", {
            toastId: TOAST_ERRO_CARREGAR,
          });
        }
      }
    }

    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario?.id]);

  function continuar() {
    if (!podeContinuar) {
      if (!toast.isActive(TOAST_SELECIONE_CTX)) {
        toast.info("Selecione fazenda e safra para continuar.", {
          toastId: TOAST_SELECIONE_CTX,
        });
      }
      return;
    }

    // persiste
    localStorage.setItem("ctx_fazenda", fazenda);
    localStorage.setItem("ctx_safra", safra);

    // salva no contexto (agora existe e não quebra)
    setWorkspace({ fazenda, safra });

    // navega
    navigate("/home", { replace: true });
  }

  return (
    <div className="poslogin-wrapper">
      <button
        className="logout-btn"
        onClick={handleLogout}
        title="Sair"
        type="button"
      >
        <FontAwesomeIcon icon={faRightFromBracket} />
      </button>

      <div className="poslogin-card">
        <h2 className="titulo-ola">Olá, {usuario?.nome || "Usuário"}</h2>
        <p className="subtitulo">
          Escolha seu ambiente de trabalho para continuar.
        </p>

        <div className="step-title">
          <div className="step-number">1</div>
          <span>Selecione a Fazenda</span>
        </div>

        <div className="fazendas-grid">
          {fazendas.map((f) => {
            const nomeFazenda = f.fazenda;
            const ativo = fazenda === nomeFazenda;

            return (
              <button
                key={f.id}
                type="button"
                className={`fazenda-card ${ativo ? "ativo" : ""}`}
                onClick={() => setFazenda(nomeFazenda)}
              >
                <span className="card-title">{nomeFazenda}</span>
              </button>
            );
          })}
        </div>

        <div className="divider" />

        <div className="step-title">
          <div className="step-number">2</div>
          <span>Selecione a Safra</span>
        </div>

        <div className="safras-grid">
          {safras.map((s) => {
            const nomeSafra = s.nome;
            const ativo = safra === nomeSafra;

            return (
              <button
                key={s.id}
                type="button"
                className={`safra-card ${ativo ? "ativo" : ""}`}
                onClick={() => setSafra(nomeSafra)}
              >
                <span className="select-value">{nomeSafra}</span>
              </button>
            );
          })}
        </div>

        <button className="btn-continuar" onClick={continuar} type="button">
          Continuar
        </button>
      </div>
    </div>
  );
}

export default PosLogin;
