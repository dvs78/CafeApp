import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPen,
  faCopy,
  faTrash,
  faFileExcel,
  faFilePdf,
} from "@fortawesome/free-solid-svg-icons";
import { memo } from "react";

function formatarData(iso) {
  if (!iso) return "";
  const data = new Date(iso);
  return data.toLocaleDateString("pt-BR");
}

function formatarNumero(valorRaw) {
  if (valorRaw === null || valorRaw === undefined || valorRaw === "")
    return "-";

  if (typeof valorRaw === "number") {
    return valorRaw.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  const numero = Number(String(valorRaw).replace(",", "."));
  if (!Number.isNaN(numero)) {
    return numero.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  return valorRaw;
}

function RealizadoLista({
  servicosFiltrados = [],
  onEditar,
  onDuplicar,
  onExcluir,
  onExportarExcel,
  onExportarPDF,
}) {
  const temServicos = servicosFiltrados.length > 0;

  return (
    <section className="card lista-card anima-card tabela-servicos-wrapper">
      {!temServicos ? (
        <p>Nenhum serviço encontrado.</p>
      ) : (
        <div className="tabela-wrapper">
          <table className="tabela-servicos">
            <thead>
              <tr>
                <th className="th-center">Data</th>
                <th className="th-center">Lavoura</th>
                <th className="th-center">Serviço</th>
                <th className="th-center">Status</th>
                <th className="th-center">Produto</th>
                <th className="th-center">Quantidade</th>
                <th className="th-center acoes">Ações</th>
              </tr>
            </thead>

            <tbody>
              {servicosFiltrados.map((s) => {
                const quantidade =
                  s.quantidade !== null && s.quantidade !== undefined
                    ? `${formatarNumero(s.quantidade)} ${
                        s.unidade || ""
                      }`.trim()
                    : "-";

                return (
                  <tr key={s.id}>
                    <td>{formatarData(s.data)}</td>
                    <td>{s.lavoura}</td>
                    <td>{s.servico}</td>

                    <td>
                      <span className={`status-badge ${s.status}`}>
                        {s.status}
                      </span>
                    </td>

                    <td>{s.produto || "-"}</td>
                    <td>{quantidade}</td>

                    {/* ✅ SOMENTE AÇÕES CENTRALIZADAS + COM ESPAÇAMENTO */}
                    <td className="acoes">
                      <div className="acoes-container">
                        <button
                          type="button"
                          className="acao editar"
                          onClick={() => onEditar(s)}
                          title="Editar"
                        >
                          <FontAwesomeIcon icon={faPen} />
                        </button>

                        <button
                          type="button"
                          className="acao copiar"
                          onClick={() => onDuplicar(s)}
                          title="Copiar"
                        >
                          <FontAwesomeIcon icon={faCopy} />
                        </button>

                        <button
                          type="button"
                          className="acao danger"
                          onClick={() => onExcluir(s)}
                          title="Excluir"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {temServicos && (
        <div className="export-buttons">
          <button
            className="btn-primary btn-export"
            type="button"
            onClick={onExportarExcel}
          >
            <FontAwesomeIcon icon={faFileExcel} /> Exportar Excel
          </button>

          <button
            className="btn-primary btn-export"
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

export default memo(RealizadoLista);
