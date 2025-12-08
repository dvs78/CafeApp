// src/pages/realizado/RealizadoLista.jsx
import { memo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPen,
  faTrash,
  faFileExcel,
  faFilePdf,
} from "@fortawesome/free-solid-svg-icons";

// -----------------------------------------------------------------------------
// HELPERS
// -----------------------------------------------------------------------------

// Formata a data corretamente, independente do formato recebido
function formatarData(iso) {
  if (!iso) return "";

  const str = iso.toString().slice(0, 10); // "YYYY-MM-DD"
  const [ano, mes, dia] = str.split("-");
  if (!ano || !mes || !dia) return "";

  return `${dia}/${mes}/${ano}`;
}

// Não altera o valor, só o "jeito" de mostrar
function formatarNumero(valorRaw) {
  if (valorRaw === null || valorRaw === undefined || valorRaw === "") {
    return "0,00";
  }

  // Se já for número
  if (typeof valorRaw === "number") {
    return valorRaw.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  const texto = String(valorRaw).trim();

  // Se já está no padrão BR com vírgula (ex.: "1.000,00", "100,00")
  if (texto.includes(",")) {
    return texto;
  }

  // Se vier "1000.00" ou "20000"
  const numero = Number(texto.replace(",", "."));
  if (!Number.isNaN(numero)) {
    return numero.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  // Qualquer coisa estranha, mostra como está
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
          <span>
            <b>Safra:</b> {safra}
          </span>
          <span>
            <b>Data:</b> {dataFormatada}
          </span>
          <span>
            <b>Lavoura:</b> {lavoura}
          </span>
          <span>
            <b>Serviço:</b> {nomeServico}
          </span>
        </div>

        {/* Linha 2 */}
        <div className="linha-2">
          <span className={`status-badge ${status}`}>{status}</span>
          <span>
            <b>Produto:</b> {produto || "-"}
          </span>
          <span>
            <b>Quantidade:</b> {quantidadeFormatada}
          </span>
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
      <h2>Serviços lançados</h2>

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
