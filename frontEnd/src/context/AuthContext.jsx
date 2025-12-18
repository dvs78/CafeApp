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

  // -----------------------------
  // Workspace inicial (hydration)
  // -----------------------------
  const [workspace, setWorkspace] = useState(() => {
    const fazenda = localStorage.getItem("ctx_fazenda") || "";
    const fazendaId = localStorage.getItem("ctx_fazenda_id") || "";

    const safra = localStorage.getItem("ctx_safra") || "";
    const safraId = localStorage.getItem("ctx_safra_id") || "";

    const clienteId = localStorage.getItem("ctx_cliente_id") || "";
    const clienteNome = localStorage.getItem("ctx_cliente_nome") || "";

    return fazenda && fazendaId && safra && safraId && clienteId
      ? { fazenda, fazendaId, safra, safraId, clienteId, clienteNome }
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

  // (Opcional) se você quiser persistir workspace sempre que setar via setWorkspace
  function syncWorkspaceToStorage(ws) {
    if (!ws) return;

    if (ws.clienteId) localStorage.setItem("ctx_cliente_id", ws.clienteId);
    if (ws.clienteNome)
      localStorage.setItem("ctx_cliente_nome", ws.clienteNome);

    if (ws.fazenda) localStorage.setItem("ctx_fazenda", ws.fazenda);
    if (ws.fazendaId) localStorage.setItem("ctx_fazenda_id", ws.fazendaId);

    if (ws.safra) localStorage.setItem("ctx_safra", ws.safra);
    if (ws.safraId) localStorage.setItem("ctx_safra_id", ws.safraId);
  }

  // -----------------------------
  // Hydration do login
  // -----------------------------
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

  // -----------------------------
  // Login / Logout
  // -----------------------------
  function login(novoToken, novoUsuario, clientesPermitidos = []) {
    setToken(novoToken);
    setUsuario(novoUsuario);
    setClientes(clientesPermitidos);

    localStorage.setItem("token", novoToken);
    localStorage.setItem("usuario", JSON.stringify(novoUsuario));
    localStorage.setItem("clientes", JSON.stringify(clientesPermitidos));

    // ✅ recomendado: ao trocar usuário, não herdar workspace antigo
    setWorkspace(null);
    clearWorkspaceStorage();
  }

  function logout() {
    setToken(null);
    setUsuario(null);
    setClientes([]);
    setWorkspace(null);

    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    localStorage.removeItem("clientes");

    // limpa contexto (nomes + ids)
    localStorage.removeItem("ctx_cliente_id");
    localStorage.removeItem("ctx_cliente_nome");

    localStorage.removeItem("ctx_fazenda");
    localStorage.removeItem("ctx_fazenda_id");

    localStorage.removeItem("ctx_safra");
    localStorage.removeItem("ctx_safra_id");

    clearWorkspaceStorage();
  }

  // ✅ opcional: persistir automaticamente quando workspace mudar
  useEffect(() => {
    if (workspace) syncWorkspaceToStorage(workspace);
  }, [workspace]);

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
