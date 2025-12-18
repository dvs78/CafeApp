// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faPen, faTrash } from "@fortawesome/free-solid-svg-icons";
// import { memo } from "react";

// function formatarData(iso) {
//   if (!iso) return "";
//   const d = new Date(iso);
//   return d.toLocaleDateString("pt-BR");
// }

// const ChuvaItem = memo(function ChuvaItem({ chuva, onEditar, onExcluir }) {
//   const dataFmt = chuva.data_formatada || formatarData(chuva.data);

//   return (
//     <li className="servico-item compacto">
//       <div className="servico-linhas">
//         <div className="linha-1">
//           <span>Data: {dataFmt}</span>
//           <span>Pluviômetro: {chuva.pluviometro || "-"}</span>
//           <span>Chuva: {Number(chuva.chuva || 0).toFixed(1)} mm</span>
//         </div>
//       </div>

//       <div className="botoes-linha">
//         <button
//           className="btn-editar"
//           type="button"
//           onClick={() => onEditar(chuva)}
//           title="Editar"
//         >
//           <FontAwesomeIcon icon={faPen} />
//         </button>

//         <button
//           className="btn-excluir"
//           type="button"
//           onClick={() => onExcluir(chuva)}
//           title="Excluir"
//         >
//           <FontAwesomeIcon icon={faTrash} />
//         </button>
//       </div>
//     </li>
//   );
// });

// function ChuvaLista({ chuvas, onEditar, onExcluir }) {
//   const lista = Array.isArray(chuvas) ? chuvas : [];
//   const tem = lista.length > 0;

//   return (
//     <section className="card lista-card anima-card">
//       {!tem ? (
//         <p>Nenhuma chuva encontrada.</p>
//       ) : (
//         <ul className="lista-servicos">
//           {lista.map((c) => (
//             <ChuvaItem
//               key={c.id}
//               chuva={c}
//               onEditar={onEditar}
//               onExcluir={onExcluir}
//             />
//           ))}
//         </ul>
//       )}
//     </section>
//   );
// }

// export default memo(ChuvaLista);
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash } from "@fortawesome/free-solid-svg-icons";
import { memo } from "react";

// ------------------------------
// HELPERS
// ------------------------------
function formatarData(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("pt-BR");
}

function formatarChuva(valor) {
  const n = Number(valor);
  if (Number.isNaN(n)) return "-";
  return `${n.toFixed(1)} mm`;
}

// ------------------------------
// ITEM
// ------------------------------
const ChuvaItem = memo(function ChuvaItem({ chuva, onEditar, onExcluir }) {
  const dataFmt = chuva.data_formatada || formatarData(chuva.data) || "-";

  return (
    <li className="servico-item compacto">
      <div className="servico-linhas">
        <div className="linha-1">
          <span>Data: {dataFmt}</span>
          <span>Pluviômetro: {chuva.pluviometro || "-"}</span>
          <span>Chuva: {formatarChuva(chuva.chuva)}</span>
        </div>
      </div>

      <div className="botoes-linha">
        <button
          className="btn-editar"
          type="button"
          onClick={() => onEditar(chuva)}
          title="Editar"
        >
          <FontAwesomeIcon icon={faPen} />
        </button>

        <button
          className="btn-excluir"
          type="button"
          onClick={() => onExcluir(chuva)}
          title="Excluir"
        >
          <FontAwesomeIcon icon={faTrash} />
        </button>
      </div>
    </li>
  );
});

// ------------------------------
// LISTA
// ------------------------------
function ChuvaLista({ chuvas, onEditar, onExcluir }) {
  const lista = Array.isArray(chuvas) ? chuvas : [];
  const temRegistros = lista.length > 0;

  return (
    <section className="card lista-card anima-card">
      {!temRegistros ? (
        <p>Nenhuma chuva encontrada.</p>
      ) : (
        <ul className="lista-servicos">
          {lista.map((c) => (
            <ChuvaItem
              key={c.id}
              chuva={c}
              onEditar={onEditar}
              onExcluir={onExcluir}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

export default memo(ChuvaLista);
