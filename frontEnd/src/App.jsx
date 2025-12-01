import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { useAuth } from "./context/AuthContext";

import Header from "./components/Header";
import Home from "./pages/home/Home";
import Realizado from "./pages/realizado/Realizado";
import Settings from "./pages/settings/Settings";
import Login from "./pages/login/Login";

function App() {
  const { usuario, logout } = useAuth(); // vem do AuthContext
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const isAdminEmail = usuario?.email === "dvs.veiga78@gmail.com";

  return (
    <BrowserRouter>
      {/* Header só aparece quando estiver logado */}
      {usuario && (
        <Header
          mostrarFiltros={mostrarFiltros}
          onToggleFiltros={() => setMostrarFiltros((prev) => !prev)}
          onLogout={logout} // se você quiser usar botão de sair no Header
        />
      )}

      <div className="app-container">
        <Routes>
          {/* LOGIN */}
          <Route
            path="/login"
            element={usuario ? <Navigate to="/home" /> : <Login />}
          />

          {/* HOME COM OS CARDS */}
          <Route
            path="/home"
            element={
              usuario ? <Home usuario={usuario} /> : <Navigate to="/login" />
            }
          />

          {/* REALIZADO */}
          <Route
            path="/realizado"
            element={
              usuario ? (
                <Realizado mostrarFiltros={mostrarFiltros} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          {/* SETTINGS – só para o email autorizado */}
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

          {/* ROTA PADRÃO */}
          <Route
            path="*"
            element={<Navigate to={usuario ? "/home" : "/login"} />}
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
