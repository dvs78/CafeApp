// TABELA
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash } from "@fortawesome/free-solid-svg-icons";
import { memo } from "react";

// ------------------------------
// HELPERS
// ------------------------------
function formatarData(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("pt-BR");
}

function formatarChuva(valor) {
  const n = Number(valor);
  if (Number.isNaN(n)) return "-";
  return `${n.toFixed(1)} mm`;
}

// ------------------------------
// LISTA (TABELA)
// ------------------------------
function ChuvaLista({ chuvas, onEditar, onExcluir }) {
  const lista = Array.isArray(chuvas) ? chuvas : [];

  if (!lista.length) {
    return (
      <section className="card lista-card anima-card">
        <p>Nenhuma chuva encontrada.</p>
      </section>
    );
  }

  return (
    <section className="card lista-card anima-card">
      <div className="tabela-wrapper">
        <table className="tabela-chuvas">
          <thead>
            <tr>
              <th>Data</th>
              <th>Pluviômetro</th>
              <th>Chuva</th>
              <th className="acoes">Ações</th>
            </tr>
          </thead>

          <tbody>
            {lista.map((c) => (
              <tr key={c.id}>
                <td>{c.data_formatada || formatarData(c.data)}</td>
                <td>{c.pluviometro || "-"}</td>
                <td>{formatarChuva(c.chuva)}</td>

                <td className="acoes">
                  <button
                    className="btn-editar"
                    type="button"
                    title="Editar"
                    onClick={() => onEditar(c)}
                  >
                    <FontAwesomeIcon icon={faPen} />
                  </button>

                  <button
                    className="btn-excluir"
                    type="button"
                    title="Excluir"
                    onClick={() => onExcluir(c)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default memo(ChuvaLista);
