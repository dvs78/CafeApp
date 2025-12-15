import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import { toast } from "react-toastify";
import { useAuth } from "./context/AuthContext";
import Header from "./components/Header";
import Home from "./pages/home/Home";
import Realizado from "./pages/realizado/Realizado";
import Settings from "./pages/settings/Settings";
import Login from "./pages/login/Login";
import PosLogin from "./pages/login/PosLogin";
import Toast from "./components/Toast";

// axios.defaults.baseURL = import.meta.env.DEV
//   ? "http://localhost:3001"
//   : "https://cafeapp-ial5.onrender.com";

const TOAST_WORKSPACE = "toast-workspace-required";

function RequireAuth({ children }) {
  const { usuario } = useAuth();
  if (!usuario) return <Navigate to="/login" replace />;
  return children;
}

function RequireWorkspace({ children }) {
  const { workspace } = useAuth();

  const clienteId =
    workspace?.clienteId || localStorage.getItem("ctx_cliente_id") || "";
  const fazenda =
    workspace?.fazenda || localStorage.getItem("ctx_fazenda") || "";
  const safra = workspace?.safra || localStorage.getItem("ctx_safra") || "";

  const ok = Boolean(clienteId && fazenda && safra);

  useEffect(() => {
    if (!ok && !toast.isActive(TOAST_WORKSPACE)) {
      toast.info("Selecione cliente, fazenda e safra para continuar.", {
        toastId: TOAST_WORKSPACE,
      });
    }
  }, [ok]);

  if (!ok) return <Navigate to="/poslogin" replace />;
  return children;
}

function RedirectIfWorkspace({ children }) {
  const { workspace } = useAuth();

  const clienteId =
    workspace?.clienteId || localStorage.getItem("ctx_cliente_id") || "";
  const fazenda =
    workspace?.fazenda || localStorage.getItem("ctx_fazenda") || "";
  const safra = workspace?.safra || localStorage.getItem("ctx_safra") || "";

  if (clienteId && fazenda && safra) return <Navigate to="/home" replace />;
  return children;
}

function AppInner() {
  const { usuario, logout } = useAuth();
  const location = useLocation();

  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [ocultarBotaoFiltros, setOcultarBotaoFiltros] = useState(false);
  const [tituloCustom, setTituloCustom] = useState("");

  const path = location.pathname.toLowerCase();
  const telaAuth = path === "/login" || path === "/poslogin";

  return (
    <>
      <Toast />

      {usuario && !telaAuth && (
        <Header
          usuario={usuario} // ✅ ADICIONE ISTO
          mostrarFiltros={mostrarFiltros}
          onToggleFiltros={() => setMostrarFiltros((prev) => !prev)}
          onLogout={logout}
          ocultarBotaoFiltros={ocultarBotaoFiltros}
          tituloCustom={tituloCustom}
        />
      )}

      <div className="app-container">
        <Routes>
          {/* 1) Sempre abrir em /login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route path="/login" element={<Login />} />

          <Route
            path="/poslogin"
            element={
              <RequireAuth>
                <RedirectIfWorkspace>
                  <PosLogin />
                </RedirectIfWorkspace>
              </RequireAuth>
            }
          />

          <Route
            path="/home"
            element={
              <RequireAuth>
                <RequireWorkspace>
                  <Home />
                </RequireWorkspace>
              </RequireAuth>
            }
          />

          <Route
            path="/realizado"
            element={
              <RequireAuth>
                <RequireWorkspace>
                  <Realizado
                    mostrarFiltros={mostrarFiltros}
                    setOcultarBotaoFiltros={setOcultarBotaoFiltros}
                    setTituloCustom={setTituloCustom}
                  />
                </RequireWorkspace>
              </RequireAuth>
            }
          />

          <Route
            path="/settings"
            element={
              <RequireAuth>
                <RequireWorkspace>
                  <Settings />
                </RequireWorkspace>
              </RequireAuth>
            }
          />

          {/* 2) Sempre por último */}
          <Route
            path="*"
            element={<Navigate to={usuario ? "/home" : "/login"} replace />}
          />
        </Routes>
      </div>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  );
}
