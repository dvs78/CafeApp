// // import { useState } from "react";
// // import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// // import { useAuth } from "./context/AuthContext";

// // import Header from "./components/Header";
// // import Home from "./pages/home/Home";
// // import Realizado from "./pages/realizado/Realizado";
// // import Settings from "./pages/settings/Settings";
// // import Login from "./pages/login/Login";
// // import PosLogin from "./pages/login/PosLogin";
// // import Toast from "./components/Toast";

// // import axios from "axios";
// // // axios.defaults.baseURL = "http://localhost:3001/";

// // axios.defaults.baseURL = import.meta.env.DEV
// //   ? "http://localhost:3001"
// //   : "https://cafeapp-ial5.onrender.com";

// // function App() {
// //   const { usuario, logout } = useAuth(); // vem do AuthContext
// //   const [mostrarFiltros, setMostrarFiltros] = useState(false);
// //   const [ocultarBotaoFiltros, setOcultarBotaoFiltros] = useState(false);
// //   const [tituloCustom, setTituloCustom] = useState("");
// //   const isAdminEmail = usuario?.email === "dvs.veiga78@gmail.com";

// //   return (
// //     <BrowserRouter>
// //       {/* Header só aparece quando estiver logado - src/App.jsx */}
// //       {usuario && (
// //         <Header
// //           usuario={usuario}
// //           mostrarFiltros={mostrarFiltros}
// //           onToggleFiltros={() => setMostrarFiltros((prev) => !prev)}
// //           onLogout={logout}
// //           ocultarBotaoFiltros={ocultarBotaoFiltros}
// //           tituloCustom={tituloCustom}
// //         />
// //       )}

// //       <div className="app-container">
// //         <Toast />
// //         <Routes>
// //           {/* LOGIN */}
// //           <Route
// //             path="/login"
// //             element={usuario ? <Navigate to="/home" /> : <Login />}
// //           />

// //           {/* HOME COM OS CARDS */}
// //           <Route
// //             path="/home"
// //             element={
// //               usuario ? <Home usuario={usuario} /> : <Navigate to="/login" />
// //             }
// //           />

// //           {/* REALIZADO */}
// //           <Route
// //             path="/realizado"
// //             element={
// //               usuario ? (
// //                 <Realizado
// //                   mostrarFiltros={mostrarFiltros}
// //                   setOcultarBotaoFiltros={setOcultarBotaoFiltros}
// //                   setTituloCustom={setTituloCustom}
// //                 />
// //               ) : (
// //                 <Navigate to="/login" />
// //               )
// //             }
// //           />
// //           <Route path="/poslogin" element={<PosLogin />} />

// //           {/* SETTINGS – só para o email autorizado */}
// //           <Route
// //             path="/settings"
// //             element={
// //               usuario ? (
// //                 isAdminEmail ? (
// //                   <Settings />
// //                 ) : (
// //                   <Navigate to="/home" />
// //                 )
// //               ) : (
// //                 <Navigate to="/login" />
// //               )
// //             }
// //           />

// //           {/* ROTA PADRÃO */}
// //           <Route
// //             path="*"
// //             element={<Navigate to={usuario ? "/home" : "/login"} />}
// //           />
// //         </Routes>
// //       </div>
// //     </BrowserRouter>
// //   );
// // }

// // export default App;
// import { useState } from "react";
// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// import { useAuth } from "./context/AuthContext";

// import Header from "./components/Header";
// import Home from "./pages/home/Home";
// import Realizado from "./pages/realizado/Realizado";
// import Settings from "./pages/settings/Settings";
// import Login from "./pages/login/Login";
// import PosLogin from "./pages/login/PosLogin";
// import Toast from "./components/Toast";

// import axios from "axios";

// axios.defaults.baseURL = import.meta.env.DEV
//   ? "http://localhost:3001"
//   : "https://cafeapp-ial5.onrender.com";

// function App() {
//   const { usuario, logout } = useAuth();
//   const [mostrarFiltros, setMostrarFiltros] = useState(false);
//   const [ocultarBotaoFiltros, setOcultarBotaoFiltros] = useState(false);
//   const [tituloCustom, setTituloCustom] = useState("");
//   const isAdminEmail = usuario?.email === "dvs.veiga78@gmail.com";

//   return (
//     <BrowserRouter>
//       {/* Header visível apenas quando estiver logado */}
//       {usuario && (
//         <Header
//           usuario={usuario}
//           mostrarFiltros={mostrarFiltros}
//           onToggleFiltros={() => setMostrarFiltros((prev) => !prev)}
//           onLogout={logout}
//           ocultarBotaoFiltros={ocultarBotaoFiltros}
//           tituloCustom={tituloCustom}
//         />
//       )}

//       <div className="app-container">
//         <Toast />

//         <Routes>
//           {/* LOGIN — SEM REDIRECIONAR PARA HOME */}
//           <Route path="/login" element={<Login />} />

//           {/* POSLOGIN — protegido */}
//           <Route
//             path="/poslogin"
//             element={usuario ? <PosLogin /> : <Navigate to="/login" />}
//           />

//           {/* HOME */}
//           <Route
//             path="/home"
//             element={
//               usuario ? <Home usuario={usuario} /> : <Navigate to="/login" />
//             }
//           />

//           {/* REALIZADO */}
//           <Route
//             path="/realizado"
//             element={
//               usuario ? (
//                 <Realizado
//                   mostrarFiltros={mostrarFiltros}
//                   setOcultarBotaoFiltros={setOcultarBotaoFiltros}
//                   setTituloCustom={setTituloCustom}
//                 />
//               ) : (
//                 <Navigate to="/login" />
//               )
//             }
//           />

//           {/* SETTINGS */}
//           <Route
//             path="/settings"
//             element={
//               usuario ? (
//                 isAdminEmail ? (
//                   <Settings />
//                 ) : (
//                   <Navigate to="/home" />
//                 )
//               ) : (
//                 <Navigate to="/login" />
//               )
//             }
//           />

//           {/* ROTA PADRÃO */}
//           <Route path="*" element={<Navigate to="/login" />} />
//         </Routes>
//       </div>
//     </BrowserRouter>
//   );
// }

// export default App;

import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import { useAuth } from "./context/AuthContext";

import Header from "./components/Header";
import Home from "./pages/home/Home";
import Realizado from "./pages/realizado/Realizado";
import Settings from "./pages/settings/Settings";
import Login from "./pages/login/Login";
import PosLogin from "./pages/login/PosLogin";
import Toast from "./components/Toast";

import axios from "axios";

axios.defaults.baseURL = import.meta.env.DEV
  ? "http://localhost:3001"
  : "https://cafeapp-ial5.onrender.com";

function AppInner() {
  const { usuario, logout } = useAuth();
  const location = useLocation();

  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [ocultarBotaoFiltros, setOcultarBotaoFiltros] = useState(false);
  const [tituloCustom, setTituloCustom] = useState("");

  const isAdminEmail = usuario?.email === "dvs.veiga78@gmail.com";

  // Esconde header especificamente no /poslogin
  const esconderHeader = location.pathname === "/poslogin";

  return (
    <>
      {usuario && !esconderHeader && (
        <Header
          usuario={usuario}
          mostrarFiltros={mostrarFiltros}
          onToggleFiltros={() => setMostrarFiltros((prev) => !prev)}
          onLogout={logout}
          ocultarBotaoFiltros={ocultarBotaoFiltros}
          tituloCustom={tituloCustom}
        />
      )}

      <div className="app-container">
        <Toast />

        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/poslogin"
            element={usuario ? <PosLogin /> : <Navigate to="/login" />}
          />

          <Route
            path="/home"
            element={
              usuario ? <Home usuario={usuario} /> : <Navigate to="/login" />
            }
          />

          <Route
            path="/realizado"
            element={
              usuario ? (
                <Realizado
                  mostrarFiltros={mostrarFiltros}
                  setOcultarBotaoFiltros={setOcultarBotaoFiltros}
                  setTituloCustom={setTituloCustom}
                />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          <Route
            path="/settings"
            element={
              usuario ? (
                isAdminEmail ? (
                  <Settings />
                ) : (
                  <Navigate to="/home" />
                )
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </>
  );
}

// BrowserRouter fica aqui fora para o useLocation funcionar
function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  );
}

export default App;
