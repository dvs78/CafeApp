// // src/pages/settings/tabs/ServicosTab.jsx
// import { useEffect, useMemo, useState } from "react";
// import api from "../../../services/api";
// import { notificar } from "../../../components/Toast";
// import FormServico from "../components/FormServico";
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

// function ServicosTab() {
//   const [servicos, setServicos] = useState([]);
//   const [abrirForm, setAbrirForm] = useState(false);
//   const [editar, setEditar] = useState(null);

//   // -------------------------
//   // PESQUISA
//   // -------------------------
//   const [q, setQ] = useState("");

//   const servicosFiltrados = useMemo(() => {
//     const termo = normalizarTexto(q);
//     if (!termo) return servicos;

//     return (servicos || []).filter((s) =>
//       normalizarTexto(s?.nome).includes(termo)
//     );
//   }, [servicos, q]);

//   // -------------------------
//   // CONFIRM DIALOG (EXCLUIR)
//   // -------------------------
//   const [confirmOpen, setConfirmOpen] = useState(false);
//   const [alvoExcluir, setAlvoExcluir] = useState(null);

//   function abrirConfirmExcluir(servico) {
//     setAlvoExcluir({ id: servico.id, nome: servico.nome });
//     setConfirmOpen(true);
//   }

//   function fecharConfirmExcluir() {
//     setConfirmOpen(false);
//     setAlvoExcluir(null);
//   }

//   async function confirmarExcluir() {
//     if (!alvoExcluir?.id) return;

//     try {
//       await api.delete(`/servicos-lista/${alvoExcluir.id}`);
//       setServicos((prev) => prev.filter((s) => s.id !== alvoExcluir.id));
//       notificar("sucesso", "Serviço removido.");
//     } catch (err) {
//       const msg = err?.response?.data?.erro || "Erro ao excluir serviço.";
//       notificar("erro", msg);
//     } finally {
//       fecharConfirmExcluir();
//     }
//   }

//   // -------------------------
//   // LOAD
//   // -------------------------
//   async function carregar() {
//     try {
//       const { data } = await api.get("/servicos-lista");
//       setServicos(data || []);
//     } catch {
//       notificar("erro", "Erro ao carregar serviços.");
//       setServicos([]);
//     }
//   }

//   useEffect(() => {
//     carregar();
//   }, []);

//   return (
//     <>
//       <div className="settings-header">
//         <h2>Serviços</h2>

//         <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
//           {/* Pesquisa */}
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
//               value={q}
//               onChange={(e) => setQ(e.target.value)}
//               placeholder="Pesquisar serviço..."
//               style={{
//                 paddingLeft: 34,
//                 height: 36,
//                 borderRadius: 10,
//                 border: "1px solid rgba(0,0,0,0.15)",
//                 outline: "none",
//                 minWidth: 260,
//               }}
//             />
//           </div>

//           <button
//             className="btn-primary"
//             type="button"
//             onClick={() => setAbrirForm(true)}
//           >
//             Novo Serviço
//           </button>
//         </div>
//       </div>

//       {/* opcional, mas ajuda quando lista é grande */}
//       <div style={{ margin: "6px 0 12px", opacity: 0.7, fontSize: 13 }}>
//         Mostrando {servicosFiltrados.length} de {servicos.length}
//       </div>

//       <table className="settings-table">
//         <thead>
//           <tr>
//             <th>Serviço</th>
//             <th width="160">Ações</th>
//           </tr>
//         </thead>

//         <tbody>
//           {servicosFiltrados.map((s) => (
//             <tr key={s.id}>
//               <td>{s.nome}</td>

//               <td className="acoes">
//                 <button
//                   type="button"
//                   className="acao editar"
//                   onClick={() => setEditar(s)}
//                   title="Editar"
//                 >
//                   <FontAwesomeIcon icon={faPen} />
//                 </button>

//                 <button
//                   type="button"
//                   className="acao danger"
//                   onClick={() => abrirConfirmExcluir(s)}
//                   title="Excluir"
//                 >
//                   <FontAwesomeIcon icon={faTrash} />
//                 </button>
//               </td>
//             </tr>
//           ))}

//           {servicosFiltrados.length === 0 && (
//             <tr>
//               <td colSpan={2}>
//                 {q
//                   ? "Nenhum serviço encontrado para essa pesquisa."
//                   : "Nenhum serviço cadastrado."}
//               </td>
//             </tr>
//           )}
//         </tbody>
//       </table>

//       {(abrirForm || editar) && (
//         <FormServico
//           servico={editar}
//           onClose={() => {
//             setAbrirForm(false);
//             setEditar(null);
//           }}
//           onSaved={() => {
//             carregar();
//             setQ(""); // opcional: limpa busca após salvar
//           }}
//         />
//       )}

//       <ConfirmDialog
//         open={confirmOpen}
//         title="Excluir serviço"
//         description={
//           alvoExcluir
//             ? `Tem certeza que deseja excluir o serviço "${alvoExcluir.nome}"?\nEsta ação não pode ser desfeita.`
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

// export default ServicosTab;
// src/pages/settings/tabs/ServicosTab.jsx
import { useEffect, useMemo, useState } from "react";
import api from "../../../services/api";
import { notificar } from "../../../components/Toast";
import FormServico from "../components/FormServico";
import ConfirmDialog from "../../../components/ConfirmDialog/ConfirmDialog";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPen,
  faTrash,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";

function normalizarTexto(txt) {
  return (txt || "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function ServicosTab() {
  const [servicos, setServicos] = useState([]);
  const [abrirForm, setAbrirForm] = useState(false);
  const [editar, setEditar] = useState(null);

  // -------------------------
  // PESQUISA (com debounce)
  // -------------------------
  const [q, setQ] = useState("");
  const [qDebounced, setQDebounced] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setQDebounced(q), 250);
    return () => clearTimeout(t);
  }, [q]);

  const servicosFiltrados = useMemo(() => {
    const termo = normalizarTexto(qDebounced);
    if (!termo) return servicos;

    return (servicos || []).filter((s) =>
      normalizarTexto(s?.nome).includes(termo)
    );
  }, [servicos, qDebounced]);

  // -------------------------
  // CONFIRM DIALOG (EXCLUIR)
  // -------------------------
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [alvoExcluir, setAlvoExcluir] = useState(null);

  function abrirConfirmExcluir(servico) {
    setAlvoExcluir({ id: servico.id, nome: servico.nome });
    setConfirmOpen(true);
  }

  function fecharConfirmExcluir() {
    setConfirmOpen(false);
    setAlvoExcluir(null);
  }

  async function confirmarExcluir() {
    if (!alvoExcluir?.id) return;

    try {
      await api.delete(`/servicos-lista/${alvoExcluir.id}`);
      setServicos((prev) => prev.filter((s) => s.id !== alvoExcluir.id));
      notificar("sucesso", "Serviço removido.");
    } catch (err) {
      const msg = err?.response?.data?.erro || "Erro ao excluir serviço.";
      notificar("erro", msg);
    } finally {
      fecharConfirmExcluir();
    }
  }

  // -------------------------
  // LOAD
  // -------------------------
  async function carregar() {
    try {
      const { data } = await api.get("/servicos-lista");
      setServicos(Array.isArray(data) ? data : []);
    } catch {
      notificar("erro", "Erro ao carregar serviços.");
      setServicos([]);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  return (
    <>
      <div className="settings-header">
        <h2>Serviços</h2>

        <div className="settings-header-actions">
          <div className="settings-search">
            <span className="settings-search__icon" aria-hidden="true">
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </span>

            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Pesquisar serviço..."
            />
          </div>

          <button
            className="btn-primary"
            type="button"
            onClick={() => setAbrirForm(true)}
          >
            Novo Serviço
          </button>
        </div>
      </div>

      <div style={{ margin: "6px 0 12px", opacity: 0.7, fontSize: 13 }}>
        Mostrando {servicosFiltrados.length} de {servicos.length}
      </div>

      <table className="settings-table">
        <thead>
          <tr>
            <th>Serviço</th>
            <th width="160">Ações</th>
          </tr>
        </thead>

        <tbody>
          {servicosFiltrados.map((s) => (
            <tr key={s.id}>
              <td>{s.nome}</td>

              <td className="acoes">
                <button
                  type="button"
                  className="acao editar"
                  onClick={() => setEditar(s)}
                  title="Editar"
                >
                  <FontAwesomeIcon icon={faPen} />
                </button>

                <button
                  type="button"
                  className="acao danger"
                  onClick={() => abrirConfirmExcluir(s)}
                  title="Excluir"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </td>
            </tr>
          ))}

          {servicosFiltrados.length === 0 && (
            <tr>
              <td colSpan={2}>
                {q.trim()
                  ? "Nenhum serviço encontrado para essa pesquisa."
                  : "Nenhum serviço cadastrado."}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {(abrirForm || editar) && (
        <FormServico
          servico={editar}
          onClose={() => {
            setAbrirForm(false);
            setEditar(null);
          }}
          onSaved={() => {
            carregar();
            setQ("");
          }}
        />
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Excluir serviço"
        description={
          alvoExcluir
            ? `Tem certeza que deseja excluir o serviço "${alvoExcluir.nome}"?\nEsta ação não pode ser desfeita.`
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

export default ServicosTab;
