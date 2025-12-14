const UNIDADES_OPCIONAIS = ["L", "Kg", "mL", "g", "uni"];

// Permite só números, vírgula e ponto. Garante no máx. 1 vírgula.
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
}) {
  // ✅ precisa ficar DENTRO do componente (para enxergar os setters)
  function limparFormulario() {
    setLavoura("");
    setServico("");
    setData("");
    setStatus("");
    setProduto("");
    setUni("");
    setQuantidade("");
  }

  return (
    <section className="card-form anima-card">
      {/* Topo no padrão do card de filtros (sem botão Cancelar) */}
      <div className="filtros-topo">
        <h2 className="filtros-title">
          {editandoId ? "Editar serviço" : "Lançar serviço"}
        </h2>
      </div>

      <form className="form-servico" onSubmit={onSubmit}>
        {/* LAVOURA | SERVIÇO lado a lado */}
        <div className="form-row">
          <div className="login-campo">
            <label className="login-label">Lavoura</label>
            <select
              className="login-input"
              value={lavoura}
              onChange={(e) => setLavoura(e.target.value)}
              disabled={!!editandoId}
            >
              <option value="">Selecione a lavoura</option>
              {listaLavouras.map((l) => (
                <option key={l.id} value={l.nome}>
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
              {listaServicos.map((s) => (
                <option key={s.id} value={s.nome}>
                  {s.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* DATA | STATUS lado a lado */}
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

        {/* PRODUTO | UNIDADE | QUANTIDADE lado a lado */}
        <div className="form-row-3">
          <div className="login-campo">
            <label className="login-label">Produto (opcional)</label>
            <select
              className="login-input"
              value={produto}
              onChange={(e) => setProduto(e.target.value)}
            >
              <option value="">Selecione o produto (opcional)</option>
              {listaProdutos.map((p) => (
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

        {/* AÇÕES */}
        <div className="form-actions">
          <button type="submit" className="btn-primario">
            {editandoId ? "Salvar alterações" : "Salvar serviço"}
          </button>

          <button
            type="button"
            className="btn-limpar-filtros"
            onClick={limparFormulario}
          >
            Limpar filtros
          </button>
        </div>
      </form>
    </section>
  );
}

export default RealizadoForm;
