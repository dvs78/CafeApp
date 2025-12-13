import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);

  const [workspace, setWorkspace] = useState(() => {
    const fazenda = localStorage.getItem("ctx_fazenda") || "";
    const safra = localStorage.getItem("ctx_safra") || "";
    const cliente = localStorage.getItem("ctx_cliente") || "";

    return fazenda && safra ? { fazenda, safra, cliente } : null;
  });

  useEffect(() => {
    const tk = localStorage.getItem("token");
    const us = localStorage.getItem("usuario");
    if (tk && us) {
      setToken(tk);
      try {
        setUsuario(JSON.parse(us));
      } catch {
        setUsuario(null);
      }
    }
  }, []);

  function login(novoToken, novoUsuario) {
    setToken(novoToken);
    setUsuario(novoUsuario);
    localStorage.setItem("token", novoToken);
    localStorage.setItem("usuario", JSON.stringify(novoUsuario));
  }

  function logout() {
    setToken(null);
    setUsuario(null);
    setWorkspace(null);

    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    localStorage.removeItem("ctx_fazenda");
    localStorage.removeItem("ctx_safra");
    localStorage.removeItem("ctx_cliente"); // ✅
  }

  const value = useMemo(
    () => ({ usuario, token, workspace, setWorkspace, login, logout }),
    [usuario, token, workspace]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx)
    throw new Error("useAuth deve ser usado dentro de <AuthProvider />");
  return ctx;
}
