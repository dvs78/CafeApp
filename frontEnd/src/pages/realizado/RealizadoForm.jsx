// import { useEffect } from "react";

// const UNIDADES_OPCIONAIS = ["L", "Kg", "mL", "g", "uni"];

// function limparEntradaQuantidade(valor) {
//   if (!valor) return "";
//   valor = valor.replace(/[^0-9.,]/g, "");

//   const partesVirgula = valor.split(",");
//   if (partesVirgula.length > 2) {
//     valor = partesVirgula[0] + "," + partesVirgula.slice(1).join("");
//   }
//   return valor;
// }

// function RealizadoForm({
//   onSubmit,
//   editandoId,

//   // ✅ novos
//   modoDuplicar,
//   lavouraOriginalDuplicacao,

//   lavoura,
//   setLavoura,
//   servico,
//   setServico,
//   data,
//   setData,
//   status,
//   setStatus,
//   produto,
//   setProduto,
//   uni,
//   setUni,
//   quantidade,
//   setQuantidade,

//   listaLavouras,
//   listaProdutos,
//   listaServicos,

//   onCancelar,
// }) {
//   useEffect(() => {
//     if (!lavoura) return;
//     const existe = (listaLavouras || []).some(
//       (l) => String(l?.nome) === String(lavoura)
//     );
//     if (!existe) setLavoura("");
//   }, [listaLavouras, lavoura, setLavoura]);

//   function limparFormulario() {
//     setLavoura("");
//     setServico("");
//     setData("");
//     setStatus("");
//     setProduto("");
//     setUni("");
//     setQuantidade("");
//   }

//   const titulo = editandoId
//     ? "Editar serviço"
//     : modoDuplicar
//     ? "Copiar serviço"
//     : "Lançar serviço";

//   return (
//     <section className="card-form anima-card">
//       <div className="filtros-topo">
//         <h2 className="filtros-title">{titulo}</h2>

//         <button
//           type="button"
//           className="btn-limpar-filtros"
//           onClick={onCancelar}
//         >
//           Fechar
//         </button>
//       </div>

//       {/* {modoDuplicar && (
//         <p style={{ marginTop: "-6px", marginBottom: "10px" }}>
//           Regra: altere a <strong>Lavoura</strong> (original:{" "}
//           <strong>{lavouraOriginalDuplicacao || "-"}</strong>) para salvar.
//         </p>
//       )} */}

//       <form className="form-servico" onSubmit={onSubmit}>
//         <div className="form-row">
//           <div className="login-campo">
//             <label className="login-label">Lavoura</label>
//             <select
//               className="login-input"
//               value={lavoura}
//               onChange={(e) => setLavoura(e.target.value)}
//               disabled={!!editandoId} // só trava na edição
//             >
//               <option value="">Selecione a lavoura</option>
//               {(listaLavouras || []).map((l) => (
//                 <option key={l.id} value={l.nome}>
//                   {l.nome}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="login-campo">
//             <label className="login-label">Serviço</label>
//             <select
//               className="login-input"
//               value={servico}
//               onChange={(e) => setServico(e.target.value)}
//             >
//               <option value="">Selecione o serviço</option>
//               {(listaServicos || []).map((s) => (
//                 <option key={s.id} value={s.nome}>
//                   {s.nome}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>

//         <div className="form-row">
//           <div className="login-campo">
//             <label className="login-label">Data</label>
//             <input
//               className="login-input"
//               type="date"
//               value={data}
//               onChange={(e) => setData(e.target.value)}
//             />
//           </div>

//           <div className="login-campo">
//             <label className="login-label">Status</label>
//             <select
//               className="login-input"
//               value={status}
//               onChange={(e) => setStatus(e.target.value)}
//             >
//               <option value="">Selecione</option>
//               <option value="realizado">Realizado</option>
//               <option value="cancelado">Cancelado</option>
//             </select>
//           </div>
//         </div>

//         <div className="form-row-3">
//           <div className="login-campo">
//             <label className="login-label">Produto (opcional)</label>
//             <select
//               className="login-input"
//               value={produto}
//               onChange={(e) => setProduto(e.target.value)}
//             >
//               <option value="">Selecione o produto (opcional)</option>
//               {(listaProdutos || []).map((p) => (
//                 <option key={p.id} value={p.nome}>
//                   {p.nome}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="login-campo">
//             <label className="login-label">Unidade (opcional)</label>
//             <select
//               className="login-input"
//               value={uni}
//               onChange={(e) => setUni(e.target.value)}
//             >
//               <option value="">Selecione</option>
//               {UNIDADES_OPCIONAIS.map((u) => (
//                 <option key={u} value={u}>
//                   {u}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="login-campo">
//             <label className="login-label">Quantidade (opcional)</label>
//             <input
//               className="login-input"
//               type="text"
//               inputMode="decimal"
//               placeholder="0"
//               value={quantidade}
//               onChange={(e) =>
//                 setQuantidade(limparEntradaQuantidade(e.target.value))
//               }
//             />
//           </div>
//         </div>

//         <div className="form-actions">
//           <button type="submit" className="btn-primario">
//             {editandoId ? "Salvar alterações" : "Salvar serviço"}
//           </button>

//           <button
//             type="button"
//             className="btn-limpar-filtros"
//             onClick={limparFormulario}
//           >
//             Limpar campos
//           </button>
//         </div>
//       </form>
//     </section>
//   );
// }

// export default RealizadoForm;
// src/pages/realizado/RealizadoForm.jsx
import { useEffect, useMemo } from "react";

const UNIDADES_OPCIONAIS = ["L", "Kg", "mL", "g", "uni"];

function limparEntradaQuantidade(valor) {
  if (!valor) return "";
  valor = valor.replace(/[^0-9.,]/g, "");

  const partesVirgula = valor.split(",");
  if (partesVirgula.length > 2) {
    valor = partesVirgula[0] + "," + partesVirgula.slice(1).join("");
  }
  return valor;
}

function RealizadoForm({
  onSubmit,
  editandoId,

  // ✅ novos
  modoDuplicar,
  lavouraOriginalDuplicacao,

  lavoura,
  setLavoura,
  servico,
  setServico,
  data,
  setData,
  status,
  setStatus,
  produto,
  setProduto,
  uni,
  setUni,
  quantidade,
  setQuantidade,

  listaLavouras,
  listaProdutos,
  listaServicos,

  onCancelar,
}) {
  // Normaliza opções de lavoura (aceita diferentes nomes de campo)
  const opcoesLavoura = useMemo(() => {
    const lista = Array.isArray(listaLavouras) ? listaLavouras : [];
    return lista
      .map((l) => ({
        id: l?.id,
        nome: l?.nome ?? l?.lavoura ?? l?.LAVOURA ?? "",
      }))
      .filter((x) => x.nome);
  }, [listaLavouras]);

  // Se a lavoura selecionada não existir mais, zera (evita "valor fantasma")
  useEffect(() => {
    if (!lavoura) return;
    const existe = opcoesLavoura.some(
      (l) => String(l.nome) === String(lavoura)
    );
    if (!existe) setLavoura("");
  }, [opcoesLavoura, lavoura, setLavoura]);

  function limparFormulario() {
    setLavoura("");
    setServico("");
    setData("");
    setStatus("");
    setProduto("");
    setUni("");
    setQuantidade("");
  }

  const titulo = editandoId
    ? "Editar serviço"
    : modoDuplicar
    ? "Copiar serviço"
    : "Lançar serviço";

  return (
    <section className="card-form anima-card">
      <div className="filtros-topo">
        <h2 className="filtros-title">{titulo}</h2>

        <button
          type="button"
          className="btn-limpar-filtros"
          onClick={onCancelar}
        >
          Fechar
        </button>
      </div>

      {modoDuplicar && (
        <p style={{ marginTop: "-6px", marginBottom: "10px" }}>
          Regra: altere a <strong>Lavoura</strong> (original:{" "}
          <strong>{lavouraOriginalDuplicacao || "-"}</strong>) para salvar.
        </p>
      )}

      <form className="form-servico" onSubmit={onSubmit}>
        <div className="form-row">
          <div className="login-campo">
            <label className="login-label">Lavoura</label>
            <select
              className="login-input"
              value={lavoura}
              onChange={(e) => setLavoura(e.target.value)}
              disabled={!!editandoId} // ✅ só trava na edição
            >
              <option value="">Selecione a lavoura</option>
              {opcoesLavoura.map((l) => (
                <option key={l.id || l.nome} value={l.nome}>
                  {l.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="login-campo">
            <label className="login-label">Serviço</label>
            <select
              className="login-input"
              value={servico}
              onChange={(e) => setServico(e.target.value)}
            >
              <option value="">Selecione o serviço</option>
              {(Array.isArray(listaServicos) ? listaServicos : []).map((s) => (
                <option key={s.id} value={s.nome}>
                  {s.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="login-campo">
            <label className="login-label">Data</label>
            <input
              className="login-input"
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
            />
          </div>

          <div className="login-campo">
            <label className="login-label">Status</label>
            <select
              className="login-input"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">Selecione</option>
              <option value="realizado">Realizado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        </div>

        <div className="form-row-3">
          <div className="login-campo">
            <label className="login-label">Produto (opcional)</label>
            <select
              className="login-input"
              value={produto}
              onChange={(e) => setProduto(e.target.value)}
            >
              <option value="">Selecione o produto (opcional)</option>
              {(Array.isArray(listaProdutos) ? listaProdutos : []).map((p) => (
                <option key={p.id} value={p.nome}>
                  {p.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="login-campo">
            <label className="login-label">Unidade (opcional)</label>
            <select
              className="login-input"
              value={uni}
              onChange={(e) => setUni(e.target.value)}
            >
              <option value="">Selecione</option>
              {UNIDADES_OPCIONAIS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          <div className="login-campo">
            <label className="login-label">Quantidade (opcional)</label>
            <input
              className="login-input"
              type="text"
              inputMode="decimal"
              placeholder="0"
              value={quantidade}
              onChange={(e) =>
                setQuantidade(limparEntradaQuantidade(e.target.value))
              }
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primario">
            {editandoId ? "Salvar alterações" : "Salvar serviço"}
          </button>

          <button
            type="button"
            className="btn-limpar-filtros"
            onClick={limparFormulario}
          >
            Limpar campos
          </button>
        </div>
      </form>
    </section>
  );
}

export default RealizadoForm;
