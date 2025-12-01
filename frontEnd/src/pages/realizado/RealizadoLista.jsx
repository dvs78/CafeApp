// src/pages/realizado/RealizadoLista.jsx
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPen,
  faTrash,
  faFileExcel,
  faFilePdf,
} from "@fortawesome/free-solid-svg-icons";

// pequena função local só para exibir data bonitinha
function formatarData(iso) {
  if (!iso) return "";
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

function RealizadoLista({
  servicosFiltrados,
  onEditar,
  onExcluir,
  onExportarExcel,
  onExportarPDF,
}) {
  return (
    <section className="card lista-card anima-card">
      <h2>Serviços lançados</h2>

      {servicosFiltrados.length === 0 ? (
        <p>Nenhum serviço encontrado.</p>
      ) : (
        <ul className="lista-servicos">
          {servicosFiltrados.map((s) => (
            <li key={s.id} className="servico-item">
              <div className="servico-conteudo">
                <span className="servico-data">{formatarData(s.data)}</span>
                <span className="servico-descricao">{s.servico}</span>

                <div className="servico-extra">
                  <span>
                    Safra: <b>{s.safra}</b>
                  </span>
                  <span>
                    Lavoura: <b>{s.lavoura}</b>
                  </span>
                  <span>
                    Produto: <b>{s.produto}</b>
                  </span>
                  <span>
                    {s.quantidade} {s.unidade}
                  </span>
                  <span>
                    Status: <b>{s.status}</b>
                  </span>
                </div>
              </div>

              <div className="botoes-linha">
                <button
                  className="btn-editar"
                  type="button"
                  onClick={() => onEditar(s)}
                >
                  <FontAwesomeIcon icon={faPen} /> Editar
                </button>
                <button
                  className="btn-excluir"
                  type="button"
                  onClick={() => onExcluir(s.id)}
                >
                  <FontAwesomeIcon icon={faTrash} /> Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {servicosFiltrados.length > 0 && (
        <div className="export-buttons">
          <button
            className="btn-primario btn-export"
            type="button"
            onClick={onExportarExcel}
          >
            <FontAwesomeIcon icon={faFileExcel} /> Exportar Excel
          </button>
          <button
            className="btn-primario btn-export"
            type="button"
            onClick={onExportarPDF}
          >
            <FontAwesomeIcon icon={faFilePdf} /> Exportar PDF
          </button>
        </div>
      )}
    </section>
  );
}

export default RealizadoLista;
