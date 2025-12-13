import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPen,
  faTrash,
  faFileExcel,
  faFilePdf,
} from "@fortawesome/free-solid-svg-icons";
import { memo } from "react";

// -----------------------------------------------------------------------------
// HELPERS
// -----------------------------------------------------------------------------

function formatarData(iso) {
  if (!iso) return "";
  const data = new Date(iso);
  return data.toLocaleDateString("pt-BR");
}

// Não altera o valor, só o "jeito" de mostrar
function formatarNumero(valorRaw) {
  if (valorRaw === null || valorRaw === undefined || valorRaw === "") {
    return "0,00";
  }

  if (typeof valorRaw === "number") {
    return valorRaw.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  const texto = String(valorRaw).trim();

  // Se já está no padrão BR com vírgula
  if (texto.includes(",")) {
    return texto;
  }

  const numero = Number(texto.replace(",", "."));
  if (!Number.isNaN(numero)) {
    return numero.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  return texto;
}

// -----------------------------------------------------------------------------
// ITEM DA LISTA (memoizado)
// -----------------------------------------------------------------------------
const ServicoItem = memo(function ServicoItem({
  servico,
  onEditar,
  onExcluir,
}) {
  const {
    id,
    safra,
    data,
    lavoura,
    servico: nomeServico,
    status,
    produto,
    quantidade,
    unidade,
  } = servico;

  const dataFormatada = formatarData(data);
  const quantidadeFormatada =
    quantidade !== null && quantidade !== undefined && quantidade !== ""
      ? `${formatarNumero(quantidade)} ${unidade || ""}`.trim()
      : "-";

  return (
    <li key={id} className="servico-item compacto">
      <div className="servico-linhas">
        {/* Linha 1 */}
        <div className="linha-1">
          <span>Lavoura: {lavoura}</span>
          <span>Serviço: {nomeServico}</span>

          <span>Data: {dataFormatada}</span>
          <span className={`status-badge ${status}`}>{status}</span>
        </div>

        {/* Linha 2 */}
        <div className="linha-2">
          <span>Produto: {produto || "-"}</span>
          <span>Quantidade: {quantidadeFormatada}</span>
        </div>
      </div>

      <div className="botoes-linha">
        <button
          className="btn-editar"
          type="button"
          onClick={() => onEditar(servico)}
        >
          <FontAwesomeIcon icon={faPen} />
        </button>

        <button
          className="btn-excluir"
          type="button"
          onClick={() => onExcluir(id)}
        >
          <FontAwesomeIcon icon={faTrash} />
        </button>
      </div>
    </li>
  );
});

// -----------------------------------------------------------------------------
// LISTA PRINCIPAL
// -----------------------------------------------------------------------------
function RealizadoLista({
  servicosFiltrados,
  onEditar,
  onExcluir,
  onExportarExcel,
  onExportarPDF,
}) {
  const temServicos = servicosFiltrados.length > 0;

  return (
    <section className="card lista-card anima-card">
      {!temServicos ? (
        <p>Nenhum serviço encontrado.</p>
      ) : (
        <ul className="lista-servicos">
          {servicosFiltrados.map((s) => (
            <ServicoItem
              key={s.id}
              servico={s}
              onEditar={onEditar}
              onExcluir={onExcluir}
            />
          ))}
        </ul>
      )}

      {temServicos && (
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

export default memo(RealizadoLista);
