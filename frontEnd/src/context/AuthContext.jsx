// // // import { createContext, useContext, useState } from "react";

// // // const AuthContext = createContext();

// // // export function AuthProvider({ children }) {
// // //   const [token, setToken] = useState(null);
// // //   const [usuario, setUsuario] = useState(null);

// // //   function login(novoToken, novoUsuario) {
// // //     setToken(novoToken);
// // //     setUsuario(novoUsuario);
// // //   }

// // //   function logout() {
// // //     setToken(null);
// // //     setUsuario(null);
// // //   }

// // //   return (
// // //     <AuthContext.Provider value={{ token, usuario, login, logout }}>
// // //       {children}
// // //     </AuthContext.Provider>
// // //   );
// // // }

// // // export function useAuth() {
// // //   return useContext(AuthContext);
// // // }

// // import { createContext, useContext, useEffect, useMemo, useState } from "react";

// // const AuthContext = createContext(null);

// // const STORAGE = {
// //   token: "token",
// //   usuario: "usuario",
// //   fazenda: "fazenda_nome",
// //   safra: "safra_nome",
// // };

// // export function AuthProvider({ children }) {
// //   const [token, setToken] = useState(null);
// //   const [usuario, setUsuario] = useState(null);

// //   // 🔹 CONTEXTO DE TRABALHO
// //   const [fazenda, setFazenda] = useState("");
// //   const [safra, setSafra] = useState("");

// //   // ---------------------------------------------------------------------------
// //   // CARREGAR DO LOCALSTORAGE AO INICIAR
// //   // ---------------------------------------------------------------------------
// //   useEffect(() => {
// //     const tokenSalvo = localStorage.getItem(STORAGE.token);
// //     const usuarioSalvo = localStorage.getItem(STORAGE.usuario);
// //     const fazendaSalva = localStorage.getItem(STORAGE.fazenda);
// //     const safraSalva = localStorage.getItem(STORAGE.safra);

// //     if (tokenSalvo) setToken(tokenSalvo);
// //     if (usuarioSalvo) setUsuario(JSON.parse(usuarioSalvo));
// //     if (fazendaSalva) setFazenda(fazendaSalva);
// //     if (safraSalva) setSafra(safraSalva);
// //   }, []);

// //   // ---------------------------------------------------------------------------
// //   // LOGIN
// //   // ---------------------------------------------------------------------------
// //   function login(novoToken, novoUsuario) {
// //     setToken(novoToken);
// //     setUsuario(novoUsuario);

// //     localStorage.setItem(STORAGE.token, novoToken);
// //     localStorage.setItem(STORAGE.usuario, JSON.stringify(novoUsuario));
// //   }

// //   // ---------------------------------------------------------------------------
// //   // DEFINIR FAZENDA / SAFRA (POSLOGIN)
// //   // ---------------------------------------------------------------------------
// //   function setWorkspace({ fazenda: f, safra: s }) {
// //     setFazenda(f || "");
// //     setSafra(s || "");

// //     if (f) localStorage.setItem(STORAGE.fazenda, f);
// //     else localStorage.removeItem(STORAGE.fazenda);

// //     if (s) localStorage.setItem(STORAGE.safra, s);
// //     else localStorage.removeItem(STORAGE.safra);
// //   }

// //   // ---------------------------------------------------------------------------
// //   // LIMPAR CONTEXTO DE TRABALHO
// //   // ---------------------------------------------------------------------------
// //   function clearWorkspace() {
// //     setFazenda("");
// //     setSafra("");
// //     localStorage.removeItem(STORAGE.fazenda);
// //     localStorage.removeItem(STORAGE.safra);
// //   }

// //   // ---------------------------------------------------------------------------
// //   // LOGOUT (LIMPA TUDO)
// //   // ---------------------------------------------------------------------------
// //   function logout() {
// //     setToken(null);
// //     setUsuario(null);
// //     clearWorkspace();

// //     localStorage.removeItem(STORAGE.token);
// //     localStorage.removeItem(STORAGE.usuario);
// //   }

// //   const value = useMemo(
// //     () => ({
// //       token,
// //       usuario,
// //       fazenda,
// //       safra,
// //       login,
// //       logout,
// //       setWorkspace,
// //       clearWorkspace,
// //     }),
// //     [token, usuario, fazenda, safra]
// //   );

// //   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// // }

// // export function useAuth() {
// //   const ctx = useContext(AuthContext);
// //   if (!ctx) {
// //     throw new Error("useAuth deve ser usado dentro de AuthProvider");
// //   }
// //   return ctx;
// // }

// import { createContext, useContext, useEffect, useMemo, useState } from "react";

// const AuthContext = createContext(null);

// export function AuthProvider({ children }) {
//   const [usuario, setUsuario] = useState(null);
//   const [token, setToken] = useState(null);

//   // workspace = fazenda + safra
//   const [workspace, setWorkspace] = useState(() => {
//     const fazenda = localStorage.getItem("ctx_fazenda") || "";
//     const safra = localStorage.getItem("ctx_safra") || "";
//     return fazenda && safra ? { fazenda, safra } : null;
//   });

//   useEffect(() => {
//     const tk = localStorage.getItem("token");
//     const us = localStorage.getItem("usuario");

//     if (tk && us) {
//       setToken(tk);
//       try {
//         setUsuario(JSON.parse(us));
//       } catch {
//         setUsuario(null);
//       }
//     }
//   }, []);

//   function login(novoToken, novoUsuario) {
//     setToken(novoToken);
//     setUsuario(novoUsuario);
//     localStorage.setItem("token", novoToken);
//     localStorage.setItem("usuario", JSON.stringify(novoUsuario));
//   }

//   function logout() {
//     setToken(null);
//     setUsuario(null);
//     setWorkspace(null);

//     localStorage.removeItem("token");
//     localStorage.removeItem("usuario");
//     localStorage.removeItem("ctx_fazenda");
//     localStorage.removeItem("ctx_safra");
//   }

//   const value = useMemo(
//     () => ({
//       usuario,
//       token,
//       workspace,
//       setWorkspace,
//       login,
//       logout,
//     }),
//     [usuario, token, workspace]
//   );

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// }

// export function useAuth() {
//   const ctx = useContext(AuthContext);
//   if (!ctx)
//     throw new Error("useAuth deve ser usado dentro de <AuthProvider />");
//   return ctx;
// }
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);

  // workspace = fazenda + safra
  const [workspace, setWorkspace] = useState(() => {
    const fazenda = localStorage.getItem("ctx_fazenda") || "";
    const safra = localStorage.getItem("ctx_safra") || "";
    return fazenda && safra ? { fazenda, safra } : null;
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
  }

  const value = useMemo(
    () => ({
      usuario,
      token,
      workspace,
      setWorkspace,
      login,
      logout,
    }),
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
