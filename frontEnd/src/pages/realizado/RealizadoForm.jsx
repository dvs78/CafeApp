// src/pages/realizado/RealizadoForm.jsx
import { useEffect, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faChevronDown } from "@fortawesome/free-solid-svg-icons";

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
  const opcoesLavoura = useMemo(() => {
    return (Array.isArray(listaLavouras) ? listaLavouras : [])
      .map((l) => ({
        id: l?.id,
        nome: l?.nome ?? l?.lavoura ?? l?.LAVOURA ?? "",
      }))
      .filter((x) => x.nome);
  }, [listaLavouras]);

  useEffect(() => {
    if (!lavoura) return;
    if (!opcoesLavoura.some((l) => l.nome === lavoura)) {
      setLavoura("");
    }
  }, [lavoura, opcoesLavoura, setLavoura]);

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
    <section className="card card-form anima-card">
      {/* HEADER */}
      <div className="card-title-row">
        <h2>{titulo}</h2>

        <button
          type="button"
          className="modal-close"
          onClick={onCancelar}
          aria-label="Fechar formulário"
          title="Fechar"
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>
      </div>

      {modoDuplicar && (
        <div className="alert-duplicar">
          Regra: altere a <strong>Lavoura</strong> (original:{" "}
          <strong>{lavouraOriginalDuplicacao || "-"}</strong>) para salvar.
        </div>
      )}

      <form className="form-grid" onSubmit={onSubmit}>
        {/* Linha 1 (Lavoura | Serviço | Data | Status) */}
        <div className="form-row-4">
          <div className="form-field">
            <label>Lavoura</label>
            <div className="form-select-wrapper">
              <select
                className="form-control"
                value={lavoura}
                onChange={(e) => setLavoura(e.target.value)}
                disabled={!!editandoId}
              >
                <option value="">Selecione a lavoura</option>
                {opcoesLavoura.map((l) => (
                  <option key={l.id || l.nome} value={l.nome}>
                    {l.nome}
                  </option>
                ))}
              </select>
              <FontAwesomeIcon icon={faChevronDown} className="select-icon" />
            </div>
          </div>

          <div className="form-field">
            <label>Serviço</label>
            <div className="form-select-wrapper">
              <select
                className="form-control"
                value={servico}
                onChange={(e) => setServico(e.target.value)}
              >
                <option value="">Selecione o serviço</option>
                {(Array.isArray(listaServicos) ? listaServicos : []).map(
                  (s) => (
                    <option key={s.id} value={s.nome}>
                      {s.nome}
                    </option>
                  )
                )}
              </select>
              <FontAwesomeIcon icon={faChevronDown} className="select-icon" />
            </div>
          </div>

          <div className="form-field">
            <label>Data</label>
            <input
              className="form-control"
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label>Status</label>
            <div className="form-select-wrapper">
              <select
                className="form-control"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">Selecione</option>
                <option value="realizado">Realizado</option>
                <option value="cancelado">Cancelado</option>
              </select>
              <FontAwesomeIcon icon={faChevronDown} className="select-icon" />
            </div>
          </div>
        </div>
        <div className="form-row-prod form-row-prod-actions">
          <div className="form-field">
            <label>Produto (opcional)</label>
            <div className="form-select-wrapper">
              <select
                className="form-control"
                value={produto}
                onChange={(e) => setProduto(e.target.value)}
              >
                <option value="">Selecione</option>
                {listaProdutos.map((p) => (
                  <option key={p.id} value={p.nome}>
                    {p.nome}
                  </option>
                ))}
              </select>
              <FontAwesomeIcon icon={faChevronDown} className="select-icon" />
            </div>
          </div>

          <div className="form-field">
            <label>Unidade</label>
            <div className="form-select-wrapper">
              <select
                className="form-control"
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
              <FontAwesomeIcon icon={faChevronDown} className="select-icon" />
            </div>
          </div>

          <div className="form-field">
            <label>Quantidade</label>
            <input
              className="form-control"
              value={quantidade}
              onChange={(e) =>
                setQuantidade(limparEntradaQuantidade(e.target.value))
              }
              placeholder="0"
            />
          </div>

          {/* 🔥 BOTÕES NA MESMA LINHA */}
          <div className="form-field form-actions-inline">
            <label>&nbsp;</label>
            <div className="actions-inline">
              <button type="submit" className="btn-primary">
                Salvar serviço
              </button>

              <button
                type="button"
                className="btn-secondary"
                onClick={limparFormulario}
              >
                Limpar campos
              </button>
            </div>
          </div>
        </div>
      </form>
    </section>
  );
}

export default RealizadoForm;
