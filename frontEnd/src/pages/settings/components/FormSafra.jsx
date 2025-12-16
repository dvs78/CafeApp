// import { useEffect, useState } from "react";
// import api from "../../../services/api";
// import { notificar } from "../../../components/Toast";

// function FormSafra({ safra, onClose, onSaved }) {
//   const editando = !!safra?.id;

//   const [nome, setNome] = useState("");
//   const [salvando, setSalvando] = useState(false);

//   useEffect(() => {
//     if (editando) setNome(safra.nome || "");
//     else setNome("");
//   }, [editando, safra]);

//   function validar() {
//     if (!nome.trim()) return "Informe o nome da safra.";
//     return null;
//   }

//   async function salvar() {
//     const erro = validar();
//     if (erro) return notificar("erro", erro);

//     setSalvando(true);
//     try {
//       const payload = { nome: nome.trim() };

//       if (editando) {
//         await api.put(`/safras-lista/${safra.id}`, payload);
//         notificar("sucesso", "Safra atualizada.");
//       } else {
//         await api.post("/safras-lista", payload);
//         notificar("sucesso", "Safra criada.");
//       }

//       onSaved?.();
//       onClose?.();
//     } catch (err) {
//       const msg = err?.response?.data?.erro || "Erro ao salvar safra.";
//       notificar("erro", msg);
//     } finally {
//       setSalvando(false);
//     }
//   }

//   return (
//     <div className="modal-backdrop">
//       <div className="modal-card">
//         <div className="modal-header">
//           <h3>{editando ? "Editar Safra" : "Nova Safra"}</h3>
//           <button type="button" className="modal-close" onClick={onClose}>
//             ×
//           </button>
//         </div>

//         <div className="modal-body">
//           <label>Safra</label>
//           <input value={nome} onChange={(e) => setNome(e.target.value)} />
//         </div>

//         <div className="modal-footer">
//           <button type="button" onClick={onClose} className="btn-secondary">
//             Cancelar
//           </button>
//           <button
//             type="button"
//             onClick={salvar}
//             className="btn-primary"
//             disabled={salvando}
//           >
//             {salvando ? "Salvando..." : "Salvar"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default FormSafra;
import { useEffect, useState, useCallback } from "react";
import api from "../../../services/api";
import { notificar } from "../../../components/Toast";

function FormSafra({ safra, onClose, onSaved }) {
  const editando = Boolean(safra?.id);

  const [nome, setNome] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    setNome(editando ? safra?.nome || "" : "");
  }, [editando, safra]);

  // ESC fecha
  const onKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") onClose?.();
    },
    [onClose]
  );

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onKeyDown]);

  function validar(valor) {
    if (!valor.trim()) return "Informe o nome da safra.";
    return null;
  }

  async function salvar() {
    if (salvando) return;

    const nomeLimpo = nome.trim();
    const erro = validar(nomeLimpo);
    if (erro) return notificar("erro", erro);

    setSalvando(true);
    try {
      const payload = { nome: nomeLimpo };

      let resp;
      if (editando) {
        resp = await api.put(`/safras-lista/${safra.id}`, payload);
        notificar("sucesso", "Safra atualizada.");
      } else {
        resp = await api.post("/safras-lista", payload);
        notificar("sucesso", "Safra criada.");
      }

      onSaved?.(resp?.data); // opcional (se você quiser atualizar sem recarregar)
      onClose?.();
    } catch (err) {
      const msg = err?.response?.data?.erro || "Erro ao salvar safra.";
      notificar("erro", msg);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        // fecha clicando fora do card (opcional, mas elegante)
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="modal-card" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{editando ? "Editar Safra" : "Nova Safra"}</h3>
          <button type="button" className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <label>Safra</label>
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex.: Safra 25/26"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                salvar();
              }
            }}
          />
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancelar
          </button>
          <button
            type="button"
            onClick={salvar}
            className="btn-primary"
            disabled={salvando}
          >
            {salvando ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default FormSafra;
