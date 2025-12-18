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

  if (texto.includes(",")) return texto;

  const numero = Number(texto.replace(",", "."));
  if (!Number.isNaN(numero)) {
    return numero.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  return texto;
}

const ServicoItem = memo(function ServicoItem({
  servico,
  onEditar,
  onDuplicar,
  onExcluir,
}) {
  const {
    id,
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
        <div className="linha-1">
          <span>Lavoura: {lavoura}</span>
          <span>Serviço: {nomeServico}</span>
          <span>Data: {dataFormatada}</span>
          <span className={`status-badge ${status}`}>{status}</span>
        </div>

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
          title="Editar"
        >
          <FontAwesomeIcon icon={faPen} />
        </button>

        <button
          className="btn-copiar"
          type="button"
          onClick={() => onDuplicar(servico)}
          title="Copiar"
        >
          <FontAwesomeIcon icon={faCopy} />
        </button>

        <button
          className="btn-excluir"
          type="button"
          onClick={() => onExcluir(servico)}
          // onClick={() => onExcluir(id)}
          title="Excluir"
        >
          <FontAwesomeIcon icon={faTrash} />
        </button>
      </div>
    </li>
  );
});

function RealizadoLista({
  servicosFiltrados,
  onEditar,
  onDuplicar,
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
              onDuplicar={onDuplicar}
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
