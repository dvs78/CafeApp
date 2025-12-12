// // src/pages/home/Home.jsx
// import { useMemo } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../../context/AuthContext";
// import "./Home.css";

// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import {
//   faClipboardCheck,
//   faGear,
//   faArrowRight,
// } from "@fortawesome/free-solid-svg-icons";

// function Home() {
//   const { usuario } = useAuth();
//   const navigate = useNavigate();

//   const nome = useMemo(() => usuario?.nome || "Usuário", [usuario]);
//   const isAdmin = usuario?.email === "dvs.veiga78@gmail.com";

//   return (
//     <div className="home-page">
//       <div className="home-card">
//         <div className="home-head">
//           <div>
//             <h2 className="home-title">Bem-vindo, {nome}</h2>
//             <p className="home-subtitle">Escolha o que deseja acessar.</p>
//           </div>
//         </div>

//         <div className="home-grid">
//           <button className="home-tile" onClick={() => navigate("/realizado")}>
//             <div className="home-tile-icon">
//               <FontAwesomeIcon icon={faClipboardCheck} />
//             </div>

//             <div className="home-tile-body">
//               <div className="home-tile-title">Realizado</div>
//               <div className="home-tile-desc">
//                 Lançar e consultar serviços realizados na fazenda.
//               </div>
//             </div>

//             <div className="home-tile-arrow">
//               <FontAwesomeIcon icon={faArrowRight} />
//             </div>
//           </button>

//           {isAdmin && (
//             <button className="home-tile" onClick={() => navigate("/settings")}>
//               <div className="home-tile-icon">
//                 <FontAwesomeIcon icon={faGear} />
//               </div>

//               <div className="home-tile-body">
//                 <div className="home-tile-title">Configurações</div>
//                 <div className="home-tile-desc">
//                   Ajustes do sistema e preferências administrativas.
//                 </div>
//               </div>

//               <div className="home-tile-arrow">
//                 <FontAwesomeIcon icon={faArrowRight} />
//               </div>
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Home;

import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Home.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClipboardCheck,
  faGear,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";

function Home() {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const nome = usuario?.nome || "Usuário";
  const isAdmin = usuario?.email === "dvs.veiga78@gmail.com";

  return (
    <div className="home-page">
      <div className="home-card">
        <h2 className="home-title">Bem-vindo, {nome}</h2>
        <p className="home-subtitle">Escolha o que deseja acessar.</p>

        <div className="home-actions">
          <button className="home-tile" onClick={() => navigate("/realizado")}>
            <div className="home-tile-left">
              <span className="home-icon">
                <FontAwesomeIcon icon={faClipboardCheck} />
              </span>
              <div>
                <div className="home-tile-title">Realizado</div>
                <div className="home-tile-desc">
                  Lançar e consultar serviços realizados.
                </div>
              </div>
            </div>
            <span className="home-arrow">
              <FontAwesomeIcon icon={faArrowRight} />
            </span>
          </button>

          {isAdmin && (
            <button className="home-tile" onClick={() => navigate("/settings")}>
              <div className="home-tile-left">
                <span className="home-icon home-icon--soft">
                  <FontAwesomeIcon icon={faGear} />
                </span>
                <div>
                  <div className="home-tile-title">
                    Configurações <span className="home-badge">Admin</span>
                  </div>
                  <div className="home-tile-desc">
                    Ajustes do sistema e preferências.
                  </div>
                </div>
              </div>
              <span className="home-arrow">
                <FontAwesomeIcon icon={faArrowRight} />
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
