// import { useEffect, useMemo, useState } from "react";
// import api from "../../../services/api";
// import { notificar } from "../../../components/Toast";

// import ConfirmDialog from "../../../components/ConfirmDialog";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faTrash } from "@fortawesome/free-solid-svg-icons";

// function UsuariosClientesTab() {
//   const [usuarios, setUsuarios] = useState([]);
//   const [clientes, setClientes] = useState([]);

//   const [usuarioId, setUsuarioId] = useState("");
//   const [vinculados, setVinculados] = useState([]);
//   const [clienteParaVincular, setClienteParaVincular] = useState("");

//   const [confirmOpen, setConfirmOpen] = useState(false);
//   const [clienteParaRemover, setClienteParaRemover] = useState(null);

//   async function carregarBase() {
//     try {
//       const [u, c] = await Promise.all([
//         api.get("/usuarios"),
//         api.get("/clientes"),
//       ]);
//       const listaUsuarios = u.data || [];
//       const listaClientes = c.data || [];

//       setUsuarios(listaUsuarios);
//       setClientes(listaClientes);

//       if (!usuarioId && listaUsuarios.length) setUsuarioId(listaUsuarios[0].id);
//     } catch {
//       notificar("erro", "Erro ao carregar usuários/clientes.");
//     }
//   }

//   async function carregarVinculos(uid) {
//     if (!uid) {
//       setVinculados([]);
//       return;
//     }
//     try {
//       const { data } = await api.get(`/usuarios-clientes/${uid}`);
//       setVinculados(data || []);
//     } catch {
//       notificar("erro", "Erro ao carregar vínculos.");
//     }
//   }

//   useEffect(() => {
//     carregarBase();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   useEffect(() => {
//     carregarVinculos(usuarioId);
//     setClienteParaVincular("");
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [usuarioId]);

//   const clientesDisponiveis = useMemo(() => {
//     const setIds = new Set(vinculados.map((v) => String(v.id)));
//     return clientes.filter((c) => !setIds.has(String(c.id)));
//   }, [clientes, vinculados]);

//   async function vincular() {
//     if (!usuarioId || !clienteParaVincular) {
//       return notificar("erro", "Selecione usuário e cliente.");
//     }

//     try {
//       await api.post("/usuarios-clientes", {
//         usuario_id: usuarioId,
//         cliente_id: clienteParaVincular,
//       });

//       notificar("sucesso", "Vínculo criado.");
//       await carregarVinculos(usuarioId);
//       setClienteParaVincular("");
//     } catch {
//       notificar("erro", "Erro ao vincular.");
//     }
//   }

//   function pedirRemover(cliente) {
//     setClienteParaRemover(cliente);
//     setConfirmOpen(true);
//   }

//   async function confirmarRemocao() {
//     const clienteId = clienteParaRemover?.id;
//     if (!usuarioId || !clienteId) return;

//     try {
//       await api.delete("/usuarios-clientes", {
//         data: { usuario_id: usuarioId, cliente_id: clienteId },
//       });

//       notificar("sucesso", "Vínculo removido.");
//       setVinculados((prev) =>
//         prev.filter((c) => String(c.id) !== String(clienteId))
//       );
//     } catch {
//       notificar("erro", "Erro ao remover vínculo.");
//     } finally {
//       setConfirmOpen(false);
//       setClienteParaRemover(null);
//     }
//   }

//   return (
//     <>
//       <div className="settings-header">
//         <h2>Usuários x Clientes</h2>

//         <div
//           style={{
//             display: "flex",
//             gap: 10,
//             alignItems: "center",
//             flexWrap: "wrap",
//           }}
//         >
//           <select
//             value={usuarioId}
//             onChange={(e) => setUsuarioId(e.target.value)}
//           >
//             {usuarios.map((u) => (
//               <option key={u.id} value={u.id}>
//                 {u.usuario} ({u.email})
//               </option>
//             ))}
//           </select>

//           <select
//             value={clienteParaVincular}
//             onChange={(e) => setClienteParaVincular(e.target.value)}
//             disabled={!usuarioId}
//           >
//             <option value="">Selecione um cliente...</option>
//             {clientesDisponiveis.map((c) => (
//               <option key={c.id} value={c.id}>
//                 {c.cliente}
//               </option>
//             ))}
//           </select>

//           <button
//             className="btn-primary"
//             type="button"
//             onClick={vincular}
//             disabled={!usuarioId || !clienteParaVincular}
//           >
//             Vincular
//           </button>
//         </div>
//       </div>

//       <table className="settings-table">
//         <thead>
//           <tr>
//             <th>Clientes vinculados</th>
//             <th width="160">Ações</th>
//           </tr>
//         </thead>

//         <tbody>
//           {vinculados.map((c) => (
//             <tr key={c.id}>
//               <td>{c.cliente}</td>
//               <td className="acoes">
//                 <button
//                   type="button"
//                   className="acao danger"
//                   title="Remover vínculo"
//                   onClick={() => pedirRemover(c)}
//                 >
//                   <FontAwesomeIcon icon={faTrash} />
//                 </button>
//               </td>
//             </tr>
//           ))}

//           {vinculados.length === 0 && (
//             <tr>
//               <td colSpan={2}>Nenhum cliente vinculado a este usuário.</td>
//             </tr>
//           )}
//         </tbody>
//       </table>

//       <ConfirmDialog
//         open={confirmOpen}
//         title="Remover vínculo"
//         message={
//           <>
//             Remover o vínculo do cliente <b>{clienteParaRemover?.cliente}</b>{" "}
//             para este usuário?
//             <br />
//             <span style={{ opacity: 0.8 }}>
//               Você pode vincular novamente depois.
//             </span>
//           </>
//         }
//         confirmText="Remover"
//         cancelText="Cancelar"
//         variant="danger"
//         onCancel={() => {
//           setConfirmOpen(false);
//           setClienteParaRemover(null);
//         }}
//         onConfirm={confirmarRemocao}
//       />
//     </>
//   );
// }

// export default UsuariosClientesTab;

// src/pages/settings/tabs/UsuariosClientesTab.jsx
import { useEffect, useMemo, useState } from "react";
import api from "../../../services/api";
import { notificar } from "../../../components/Toast";

import ConfirmDialog from "../../../components/ConfirmDialog";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

function UsuariosClientesTab() {
  const [usuarios, setUsuarios] = useState([]);
  const [clientes, setClientes] = useState([]);

  const [usuarioId, setUsuarioId] = useState("");
  const [vinculados, setVinculados] = useState([]);
  const [clienteParaVincular, setClienteParaVincular] = useState("");

  // -------------------------
  // CONFIRM DIALOG (REMOVER VÍNCULO)
  // -------------------------
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [clienteParaRemover, setClienteParaRemover] = useState(null);

  function fecharConfirm() {
    setConfirmOpen(false);
    setClienteParaRemover(null);
  }

  async function carregarBase() {
    try {
      const [u, c] = await Promise.all([
        api.get("/usuarios"),
        api.get("/clientes"),
      ]);

      const listaUsuarios = Array.isArray(u.data) ? u.data : [];
      const listaClientes = Array.isArray(c.data) ? c.data : [];

      setUsuarios(listaUsuarios);
      setClientes(listaClientes);

      if (!usuarioId && listaUsuarios.length) setUsuarioId(listaUsuarios[0].id);
    } catch {
      notificar("erro", "Erro ao carregar usuários/clientes.");
    }
  }

  async function carregarVinculos(uid) {
    if (!uid) {
      setVinculados([]);
      return;
    }
    try {
      const { data } = await api.get(`/usuarios-clientes/${uid}`);
      setVinculados(Array.isArray(data) ? data : []);
    } catch {
      notificar("erro", "Erro ao carregar vínculos.");
      setVinculados([]);
    }
  }

  useEffect(() => {
    carregarBase();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // evita remover vínculo do usuário errado após trocar o select
    fecharConfirm();
    carregarVinculos(usuarioId);
    setClienteParaVincular("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuarioId]);

  const clientesDisponiveis = useMemo(() => {
    const setIds = new Set((vinculados || []).map((v) => String(v.id)));
    return (clientes || []).filter((c) => !setIds.has(String(c.id)));
  }, [clientes, vinculados]);

  async function vincular() {
    if (!usuarioId || !clienteParaVincular) {
      return notificar("erro", "Selecione usuário e cliente.");
    }

    try {
      await api.post("/usuarios-clientes", {
        usuario_id: usuarioId,
        cliente_id: clienteParaVincular,
      });

      notificar("sucesso", "Vínculo criado.");
      await carregarVinculos(usuarioId);
      setClienteParaVincular("");
    } catch (err) {
      const msg = err?.response?.data?.erro || "Erro ao vincular.";
      notificar("erro", msg);
    }
  }

  function pedirRemover(cliente) {
    setClienteParaRemover({ id: cliente.id, cliente: cliente.cliente });
    setConfirmOpen(true);
  }

  async function confirmarRemocao() {
    const clienteId = clienteParaRemover?.id;
    if (!usuarioId || !clienteId) return;

    try {
      await api.delete("/usuarios-clientes", {
        data: { usuario_id: usuarioId, cliente_id: clienteId },
      });

      notificar("sucesso", "Vínculo removido.");
      setVinculados((prev) =>
        (prev || []).filter((c) => String(c.id) !== String(clienteId))
      );
    } catch (err) {
      const msg = err?.response?.data?.erro || "Erro ao remover vínculo.";
      notificar("erro", msg);
    } finally {
      fecharConfirm();
    }
  }

  return (
    <>
      <div className="settings-header">
        <h2>Usuários x Clientes</h2>

        <div
          className="settings-header-actions"
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <select
            value={usuarioId}
            onChange={(e) => setUsuarioId(e.target.value)}
          >
            {usuarios.map((u) => (
              <option key={u.id} value={u.id}>
                {u.usuario} ({u.email})
              </option>
            ))}
          </select>

          <select
            value={clienteParaVincular}
            onChange={(e) => setClienteParaVincular(e.target.value)}
            disabled={!usuarioId}
          >
            <option value="">Selecione um cliente...</option>
            {clientesDisponiveis.map((c) => (
              <option key={c.id} value={c.id}>
                {c.cliente}
              </option>
            ))}
          </select>

          <button
            className="btn-primary"
            type="button"
            onClick={vincular}
            disabled={!usuarioId || !clienteParaVincular}
          >
            Vincular
          </button>
        </div>
      </div>

      <table className="settings-table">
        <thead>
          <tr>
            <th>Clientes vinculados</th>
            <th width="160">Ações</th>
          </tr>
        </thead>

        <tbody>
          {vinculados.map((c) => (
            <tr key={c.id}>
              <td>{c.cliente}</td>
              <td className="acoes">
                <button
                  type="button"
                  className="acao danger"
                  title="Remover vínculo"
                  onClick={() => pedirRemover(c)}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </td>
            </tr>
          ))}

          {vinculados.length === 0 && (
            <tr>
              <td colSpan={2}>Nenhum cliente vinculado a este usuário.</td>
            </tr>
          )}
        </tbody>
      </table>

      <ConfirmDialog
        open={confirmOpen}
        title="Remover vínculo"
        description={
          clienteParaRemover
            ? `Remover o vínculo do cliente "${clienteParaRemover.cliente}" para este usuário?\nVocê pode vincular novamente depois.`
            : ""
        }
        confirmLabel="Remover"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={confirmarRemocao}
        onCancel={fecharConfirm}
      />
    </>
  );
}

export default UsuariosClientesTab;
