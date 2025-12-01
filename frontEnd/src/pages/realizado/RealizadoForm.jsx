// src/pages/realizado/RealizadoForm.jsx
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons"; // se quiser usar loading no futuro

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
      <form onSubmit={onSubmit} className="form-servico">
        {/* LINHA 1 – Safra + Lavoura */}
        <div className="linha-form">
          <div className="campo">
            <label>Safra</label>
            <select
              value={safra}
              onChange={(e) => setSafra(e.target.value)}
              required
            >
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
              required
            >
              <option value="">Selecione a lavoura</option>
              {listaLavouras.map((lav) => (
                <option key={lav.id} value={lav.nome}>
                  {lav.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* LINHA 2 – Serviço */}
        <div className="linha-form">
          <div className="campo">
            <label>Serviço</label>
            <select
              value={servico}
              onChange={(e) => setServico(e.target.value)}
              required
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

        {/* LINHA 3 – Data + Status */}
        <div className="linha-form">
          <div className="campo">
            <label>Data</label>
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              required
            />
          </div>

          <div className="campo">
            <label>Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              required
            >
              <option value="">Selecione</option>
              <option value="realizado">Realizado</option>
              <option value="pendente">Pendente</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        </div>

        {/* LINHA 4 – Produto / Unidade / Quantidade */}
        <div className="linha-form linha-form--3">
          <div className="campo">
            <label>Produto</label>
            <select
              value={produto}
              onChange={(e) => setProduto(e.target.value)}
            >
              <option value="">Selecione o produto</option>
              {listaProdutos.map((p) => (
                <option key={p.id} value={p.nome}>
                  {p.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="campo">
            <label>Unidade</label>
            <select value={uni} onChange={(e) => setUni(e.target.value)}>
              <option value="">Selecione</option>
              <option value="L">Litro (L)</option>
              <option value="KG">Quilo (KG)</option>
              <option value="UN">Unidade (UN)</option>
              <option value="SC">Saco (SC)</option>
            </select>
          </div>

          <div className="campo">
            <label>Quantidade</label>
            <input
              type="number"
              step="0.01"
              placeholder="0,00"
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
            />
          </div>
        </div>

        <button className="btn-primario">
          {editandoId ? "Salvar alterações" : "Lançar serviço"}
        </button>
      </form>
    </section>
  );
}

export default RealizadoForm;
