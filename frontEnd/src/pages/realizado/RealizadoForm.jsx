import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave } from "@fortawesome/free-solid-svg-icons";

function formatarQuantidadeBR(valor) {
  if (!valor) return "";

  // remove tudo que não for número
  let v = valor.replace(/\D/g, "");

  if (!v) return "";

  // adiciona centavos
  v = (parseInt(v, 10) / 100).toFixed(2);

  // troca . por , para centavos
  v = v.replace(".", ",");

  // adiciona pontos de milhar
  return v.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function RealizadoForm({
  onSubmit,
  editandoId,
  safra,
  setSafra,
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
  listaSafras,
  listaLavouras,
  listaProdutos,
  listaServicos,
}) {
  return (
    <section className="card card-form anima-card">
      <div className="card-title-row">
        <h2>{editandoId ? "Editar serviço" : "Lançar serviço"}</h2>
      </div>

      <form className="form-servico" onSubmit={onSubmit}>
        {/* SAFRA | LAVOURA */}
        <div className="form-row">
          <div className="campo">
            <label>Safra</label>
            <select value={safra} onChange={(e) => setSafra(e.target.value)}>
              <option value="">Selecione a safra</option>
              {listaSafras.map((s) => (
                <option key={s.id} value={s.nome}>
                  {s.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="campo">
            <label>Lavoura</label>
            <select
              value={lavoura}
              onChange={(e) => setLavoura(e.target.value)}
            >
              <option value="">Selecione a lavoura</option>
              {listaLavouras.map((l) => (
                <option key={l.id} value={l.nome}>
                  {l.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* SERVIÇO (linha inteira) */}
        <div className="form-row-full">
          <div className="campo">
            <label>Serviço</label>
            <select
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

        {/* DATA | STATUS */}
        <div className="form-row">
          <div className="campo">
            <label>Data</label>
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
            />
          </div>

          <div className="campo">
            <label>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Selecione</option>
              <option value="realizado">Realizado</option>
              <option value="pendente">Pendente</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        </div>

        {/* PRODUTO (opcional, linha inteira) */}

        {/* PRODUTO | UNIDADE | QUANTIDADE (3 colunas lado a lado) */}
        <div className="form-row-3">
          <div className="campo">
            <label>Produto (opcional)</label>
            <select
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

          <div className="campo">
            <label>Unidade (opcional)</label>
            <select value={uni} onChange={(e) => setUni(e.target.value)}>
              <option value="">Selecione</option>
              <option value="L">L</option>
              <option value="Kg">Kg</option>
              <option value="mL">mL</option>
              <option value="g">g</option>
            </select>
          </div>

          <div className="campo">
            <label>Quantidade (opcional)</label>
            <input
              type="text" // 👈 não usa "number", senão não aceita 200.000,00
              inputMode="decimal" // 👈 teclado numérico no celular
              placeholder="0,00"
              value={quantidade}
              onChange={(e) => {
                const somenteNumeros = e.target.value.replace(/\D/g, "");
                setQuantidade(formatarQuantidadeBR(somenteNumeros));
              }}
            />
          </div>
        </div>

        {/* BOTÃO */}
        <button type="submit" className="btn-primario">
          <FontAwesomeIcon icon={faSave} />
          {editandoId ? "Salvar alterações" : "Lançar serviço"}
        </button>
      </form>
    </section>
  );
}

export default RealizadoForm;
