import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);

  const [clientes, setClientes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("clientes") || "[]");
    } catch {
      return [];
    }
  });

  const [workspace, setWorkspace] = useState(() => {
    const fazenda = localStorage.getItem("ctx_fazenda") || "";
    const safra = localStorage.getItem("ctx_safra") || "";
    const clienteId = localStorage.getItem("ctx_cliente_id") || "";
    const clienteNome = localStorage.getItem("ctx_cliente_nome") || "";

    return fazenda && safra && clienteId
      ? { fazenda, safra, clienteId, clienteNome }
      : null;
  });
  function clearWorkspaceStorage() {
    // remove qualquer chave do contexto (ctx_ e cb_)
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (!k) continue;

      if (k.startsWith("ctx_") || k.startsWith("cb_")) {
        localStorage.removeItem(k);
      }
    }
  }

  useEffect(() => {
    const tk = localStorage.getItem("token");
    const us = localStorage.getItem("usuario");
    const cls = localStorage.getItem("clientes");

    if (tk && us) {
      setToken(tk);
      try {
        setUsuario(JSON.parse(us));
      } catch {
        setUsuario(null);
      }
    }

    if (cls) {
      try {
        setClientes(JSON.parse(cls));
      } catch {
        setClientes([]);
      }
    }
  }, []);

  // AGORA: recebe também a lista de clientes permitidos
  function login(novoToken, novoUsuario, clientesPermitidos = []) {
    setToken(novoToken);
    setUsuario(novoUsuario);
    setClientes(clientesPermitidos);

    localStorage.setItem("token", novoToken);
    localStorage.setItem("usuario", JSON.stringify(novoUsuario));
    localStorage.setItem("clientes", JSON.stringify(clientesPermitidos));
  }

  function logout() {
    setToken(null);
    setUsuario(null);
    setClientes([]);
    setWorkspace(null);

    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    localStorage.removeItem("clientes");

    localStorage.removeItem("ctx_cliente_id");
    localStorage.removeItem("ctx_cliente_nome");

    localStorage.removeItem("ctx_fazenda");
    localStorage.removeItem("ctx_safra");

    // se você guarda ids também:
    localStorage.removeItem("ctx_cliente_id");
    localStorage.removeItem("ctx_fazenda_id");
    clearWorkspaceStorage(); // <- mata o ctx_fazenda_id (e qualquer outro ctx_* “fantasma”)
  }

  const value = useMemo(
    () => ({
      usuario,
      token,
      clientes,
      setClientes,
      workspace,
      setWorkspace,
      login,
      logout,
    }),
    [usuario, token, clientes, workspace]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx)
    throw new Error("useAuth deve ser usado dentro de <AuthProvider />");
  return ctx;
}
