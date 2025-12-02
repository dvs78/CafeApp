// src/pages/realizado/RealizadoLista.jsx
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPen,
  faTrash,
  faFileExcel,
  faFilePdf,
} from "@fortawesome/free-solid-svg-icons";

// Formata a data corretamente, independente do formato recebido
function formatarData(iso) {
  if (!iso) return "";
  const data = new Date(iso);
  return data.toLocaleDateString("pt-BR"); // ex.: 05/12/2025
}

function formatarNumero(valor) {
  if (valor === null || valor === undefined || valor === "") return "0,00";

  const numero = Number(valor);
  if (Number.isNaN(numero)) return "0,00";

  return numero.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
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
            <li key={s.id} className="servico-item compacto">
              <div className="servico-linhas">
                {/* Linha 1 — principais */}
                <div className="servico-linhas">
                  <div className="servico-linhas">
                    {/* Linha 1 */}
                    <div className="linha-1">
                      <span>
                        <b>Safra:</b> {s.safra}
                      </span>
                      <span>
                        <b>Data:</b> {formatarData(s.data)}
                      </span>
                      <span>
                        <b>Lavoura:</b> {s.lavoura}
                      </span>
                      <span>
                        <b>Serviço:</b> {s.servico}
                      </span>
                    </div>

                    {/* Linha 2 */}
                    <div className="linha-2">
                      <span className={`status-badge ${s.status}`}>
                        {s.status}
                      </span>
                      <span>
                        <b>Produto:</b> {s.produto || "-"}
                      </span>
                      <span>
                        <b>Quantidade:</b>{" "}
                        {s.quantidade != null && s.quantidade !== ""
                          ? formatarNumero(s.quantidade)
                          : "-"}{" "}
                        {s.unidade || ""}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="botoes-linha">
                <button
                  className="btn-editar"
                  type="button"
                  onClick={() => onEditar(s)}
                >
                  <FontAwesomeIcon icon={faPen} />
                </button>

                <button
                  className="btn-excluir"
                  type="button"
                  onClick={() => onExcluir(s.id)}
                >
                  <FontAwesomeIcon icon={faTrash} />
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
