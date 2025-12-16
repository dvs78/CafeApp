// // src/pages/settings/tabs/ProdutosTab.jsx
// import { useEffect, useMemo, useState } from "react";
// import api from "../../../services/api";
// import { notificar } from "../../../components/Toast";
// import FormProduto from "../components/FormProduto";
// import ConfirmDialog from "../../../components/ConfirmDialog";

// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import {
//   faPen,
//   faTrash,
//   faMagnifyingGlass,
// } from "@fortawesome/free-solid-svg-icons";

// function normalizarTexto(txt) {
//   return (txt || "")
//     .toString()
//     .normalize("NFD")
//     .replace(/[\u0300-\u036f]/g, "") // remove acentos
//     .toLowerCase()
//     .trim();
// }

// function ProdutosTab() {
//   const [produtos, setProdutos] = useState([]);

//   const [filtroAtivo, setFiltroAtivo] = useState("true"); // true|false|""
//   const [busca, setBusca] = useState("");

//   // debounce da busca (evita bater API a cada tecla)
//   const [buscaDebounced, setBuscaDebounced] = useState("");
//   useEffect(() => {
//     const t = setTimeout(() => setBuscaDebounced(busca), 300);
//     return () => clearTimeout(t);
//   }, [busca]);

//   const [abrirForm, setAbrirForm] = useState(false);
//   const [editar, setEditar] = useState(null);

//   // -------------------------
//   // CONFIRM DIALOG (EXCLUIR)
//   // -------------------------
//   const [confirmOpen, setConfirmOpen] = useState(false);
//   const [alvoExcluir, setAlvoExcluir] = useState(null);

//   function abrirConfirmExcluir(produto) {
//     setAlvoExcluir({
//       id: produto.id,
//       nome: produto.nome,
//       ativo: !!produto.ativo,
//     });
//     setConfirmOpen(true);
//   }

//   function fecharConfirmExcluir() {
//     setConfirmOpen(false);
//     setAlvoExcluir(null);
//   }

//   async function confirmarExcluir() {
//     if (!alvoExcluir?.id) return;

//     try {
//       await api.delete(`/produtos/${alvoExcluir.id}`);
//       setProdutos((prev) => prev.filter((p) => p.id !== alvoExcluir.id));
//       notificar("sucesso", "Produto removido.");
//     } catch (err) {
//       const msg = err?.response?.data?.erro || "Erro ao excluir produto.";
//       notificar("erro", msg);
//     } finally {
//       fecharConfirmExcluir();
//     }
//   }

//   // -------------------------
//   // PARAMS + LOAD
//   // -------------------------
//   const params = useMemo(() => {
//     const p = {};
//     if (filtroAtivo === "true" || filtroAtivo === "false")
//       p.ativo = filtroAtivo;

//     const q = normalizarTexto(buscaDebounced);
//     if (q) p.q = q;

//     return p;
//   }, [filtroAtivo, buscaDebounced]);

//   async function carregar() {
//     try {
//       const { data } = await api.get("/produtos", { params });
//       setProdutos(Array.isArray(data) ? data : []);
//     } catch (err) {
//       console.error(err);
//       notificar("erro", "Erro ao carregar produtos.");
//       setProdutos([]);
//     }
//   }

//   useEffect(() => {
//     carregar();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [params]);

//   // (Opcional) filtro local extra para deixar a UI instantânea,
//   // mesmo se o backend já filtra por q.
//   const produtosFiltrados = useMemo(() => {
//     const termo = normalizarTexto(busca);
//     if (!termo) return produtos;

//     return (produtos || []).filter((p) =>
//       normalizarTexto(p?.nome).includes(termo)
//     );
//   }, [produtos, busca]);

//   return (
//     <>
//       <div className="settings-topbar">
//         <div className="settings-topbar-left">
//           <div className="settings-topbar-title">Produtos</div>
//           <div className="settings-topbar-subtitle">
//             Cadastro de produtos e insumos
//           </div>
//         </div>

//         <div className="settings-topbar-actions">
//           {/* Pesquisa com ícone */}
//           <div style={{ position: "relative" }}>
//             <span
//               style={{
//                 position: "absolute",
//                 left: 10,
//                 top: "50%",
//                 transform: "translateY(-50%)",
//                 opacity: 0.6,
//                 pointerEvents: "none",
//               }}
//             >
//               <FontAwesomeIcon icon={faMagnifyingGlass} />
//             </span>

//             <input
//               value={busca}
//               onChange={(e) => setBusca(e.target.value)}
//               placeholder="Buscar produto..."
//               style={{ paddingLeft: 34 }}
//             />
//           </div>

//           <select
//             value={filtroAtivo}
//             onChange={(e) => setFiltroAtivo(e.target.value)}
//             title="Filtrar status"
//           >
//             <option value="true">Ativos</option>
//             <option value="false">Inativos</option>
//             <option value="">Todos</option>
//           </select>

//           <button
//             className="btn-primary"
//             type="button"
//             onClick={() => setAbrirForm(true)}
//           >
//             Novo Produto
//           </button>
//         </div>
//       </div>

//       <div className="settings-divider" />

//       {/* contador (opcional, mas útil) */}
//       <div style={{ margin: "6px 0 12px", opacity: 0.7, fontSize: 13 }}>
//         Mostrando {produtosFiltrados.length} de {produtos.length}
//       </div>

//       <table className="settings-table">
//         <thead>
//           <tr>
//             <th>Produto</th>
//             <th width="120">Status</th>
//             <th width="180">Ações</th>
//           </tr>
//         </thead>

//         <tbody>
//           {produtosFiltrados.map((p) => (
//             <tr key={p.id}>
//               <td>{p.nome}</td>
//               <td>{p.ativo ? "Ativo" : "Inativo"}</td>

//               <td className="acoes">
//                 <button
//                   type="button"
//                   className="acao editar"
//                   onClick={() => setEditar(p)}
//                   title="Editar"
//                 >
//                   <FontAwesomeIcon icon={faPen} />
//                 </button>

//                 <button
//                   type="button"
//                   className="acao danger"
//                   onClick={() => abrirConfirmExcluir(p)}
//                   title="Excluir"
//                 >
//                   <FontAwesomeIcon icon={faTrash} />
//                 </button>
//               </td>
//             </tr>
//           ))}

//           {produtosFiltrados.length === 0 && (
//             <tr>
//               <td colSpan={3}>
//                 {busca.trim()
//                   ? "Nenhum produto encontrado para essa pesquisa."
//                   : "Nenhum produto encontrado."}
//               </td>
//             </tr>
//           )}
//         </tbody>
//       </table>

//       {(abrirForm || editar) && (
//         <FormProduto
//           produto={editar}
//           onClose={() => {
//             setAbrirForm(false);
//             setEditar(null);
//           }}
//           onSaved={() => {
//             carregar();
//             // opcional: setBusca("");
//           }}
//         />
//       )}

//       <ConfirmDialog
//         open={confirmOpen}
//         title="Excluir produto"
//         description={
//           alvoExcluir
//             ? `Tem certeza que deseja excluir o produto "${alvoExcluir.nome}"?\n` +
//               `Status: ${alvoExcluir.ativo ? "Ativo" : "Inativo"}\n\n` +
//               `Esta ação não pode ser desfeita.`
//             : ""
//         }
//         confirmLabel="Confirmar"
//         cancelLabel="Cancelar"
//         variant="danger"
//         onConfirm={confirmarExcluir}
//         onCancel={fecharConfirmExcluir}
//       />
//     </>
//   );
// }

// export default ProdutosTab;

// src/pages/settings/tabs/ProdutosTab.jsx
import { useEffect, useMemo, useState } from "react";
import api from "../../../services/api";
import { notificar } from "../../../components/Toast";
import FormProduto from "../components/FormProduto";
import ConfirmDialog from "../../../components/ConfirmDialog";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPen,
  faTrash,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";

function ProdutosTab() {
  const [produtos, setProdutos] = useState([]);

  const [filtroAtivo, setFiltroAtivo] = useState("true"); // true|false|""
  const [busca, setBusca] = useState("");
  const [buscaDebounced, setBuscaDebounced] = useState("");

  const [abrirForm, setAbrirForm] = useState(false);
  const [editar, setEditar] = useState(null);

  // -------------------------
  // CONFIRM DIALOG (EXCLUIR)
  // -------------------------
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [alvoExcluir, setAlvoExcluir] = useState(null);

  function abrirConfirmExcluir(produto) {
    setAlvoExcluir({ id: produto.id, nome: produto.nome });
    setConfirmOpen(true);
  }

  function fecharConfirmExcluir() {
    setConfirmOpen(false);
    setAlvoExcluir(null);
  }

  async function confirmarExcluir() {
    if (!alvoExcluir?.id) return;

    try {
      await api.delete(`/produtos/${alvoExcluir.id}`);
      setProdutos((prev) => prev.filter((p) => p.id !== alvoExcluir.id));
      notificar("sucesso", "Produto removido.");
    } catch (err) {
      const msg = err?.response?.data?.erro || "Erro ao excluir produto.";
      notificar("erro", msg);
    } finally {
      fecharConfirmExcluir();
    }
  }

  // -------------------------
  // DEBOUNCE (evita chamadas a cada tecla)
  // -------------------------
  useEffect(() => {
    const t = setTimeout(() => setBuscaDebounced(busca), 250);
    return () => clearTimeout(t);
  }, [busca]);

  const params = useMemo(() => {
    const p = {};
    if (filtroAtivo === "true" || filtroAtivo === "false")
      p.ativo = filtroAtivo;
    if (buscaDebounced.trim()) p.q = buscaDebounced.trim();
    return p;
  }, [filtroAtivo, buscaDebounced]);

  async function carregar() {
    try {
      const { data } = await api.get("/produtos", { params });
      setProdutos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      notificar("erro", "Erro ao carregar produtos.");
      setProdutos([]);
    }
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  return (
    <>
      <div className="settings-header">
        <h2>Produtos</h2>

        <div className="settings-header-actions">
          <div className="settings-search">
            <span className="settings-search__icon" aria-hidden="true">
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </span>

            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar produto..."
            />
          </div>

          {/* Importante: fixar uma largura para o select não virar "100%" no header */}
          <select
            value={filtroAtivo}
            onChange={(e) => setFiltroAtivo(e.target.value)}
            style={{ width: 180 }}
          >
            <option value="true">Ativos</option>
            <option value="false">Inativos</option>
            <option value="">Todos</option>
          </select>

          <button
            className="btn-primary"
            type="button"
            onClick={() => setAbrirForm(true)}
          >
            Novo Produto
          </button>
        </div>
      </div>

      <div style={{ margin: "6px 0 12px", opacity: 0.7, fontSize: 13 }}>
        Mostrando {produtos.length} item(ns)
      </div>

      <table className="settings-table">
        <thead>
          <tr>
            <th>Produto</th>
            <th width="120">Status</th>
            <th width="160">Ações</th>
          </tr>
        </thead>

        <tbody>
          {produtos.map((p) => (
            <tr key={p.id}>
              <td>{p.nome}</td>
              <td>{p.ativo ? "Ativo" : "Inativo"}</td>

              <td className="acoes">
                <button
                  type="button"
                  className="acao editar"
                  onClick={() => setEditar(p)}
                  title="Editar"
                >
                  <FontAwesomeIcon icon={faPen} />
                </button>

                <button
                  type="button"
                  className="acao danger"
                  onClick={() => abrirConfirmExcluir(p)}
                  title="Excluir"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </td>
            </tr>
          ))}

          {produtos.length === 0 && (
            <tr>
              <td colSpan={3}>
                {buscaDebounced.trim()
                  ? "Nenhum produto encontrado para essa pesquisa."
                  : "Nenhum produto encontrado."}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {(abrirForm || editar) && (
        <FormProduto
          produto={editar}
          onClose={() => {
            setAbrirForm(false);
            setEditar(null);
          }}
          onSaved={() => {
            carregar();
          }}
        />
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Excluir produto"
        description={
          alvoExcluir
            ? `Tem certeza que deseja excluir o produto "${alvoExcluir.nome}"?\nEsta ação não pode ser desfeita.`
            : ""
        }
        confirmLabel="Confirmar"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={confirmarExcluir}
        onCancel={fecharConfirmExcluir}
      />
    </>
  );
}

export default ProdutosTab;
