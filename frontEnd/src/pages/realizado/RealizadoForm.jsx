// src/pages/realizado/RealizadoForm.jsx
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave } from "@fortawesome/free-solid-svg-icons";

// Permitir:
// - dígitos
// - UMA vírgula ou ponto como decimal
// Permite só dígitos e UMA vírgula (padrão BR)
function limparEntradaQuantidade(valor) {
  if (!valor) return "";

  // permite apenas números, vírgula e ponto
  valor = valor.replace(/[^0-9.,]/g, "");

  // ❗ evita múltiplas vírgulas (decimal)
  const partesVirgula = valor.split(",");
  if (partesVirgula.length > 2) {
    valor = partesVirgula[0] + "," + partesVirgula.slice(1).join("");
  }

  // ❗ permite pontos de milhar — múltiplos pontos são permitidos:
  // "1.2.3.4,50" → deixamos, porque o usuário pode apagar depois
  // O backend vai tratar corretamente.

  return valor;
}

const UNIDADES_OPCIONAIS = ["L", "Kg", "mL", "g", "uni"];

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
        {/* LAVOURA | SERVIÇO lado a lado */}
        <div className="form-row">
          <div className="campo">
            <label>Lavoura</label>
            <select
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
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        </div>

        {/* PRODUTO | UNIDADE | QUANTIDADE */}
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
              {UNIDADES_OPCIONAIS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          <div className="campo">
            <label>Quantidade (opcional)</label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="0"
              value={quantidade}
              onChange={(e) => {
                const limpo = limparEntradaQuantidade(e.target.value);
                setQuantidade(limpo);
              }}
            />
          </div>
        </div>

        <button type="submit" className="btn-primario">
          <FontAwesomeIcon icon={faSave} />
          {editandoId ? "Salvar alterações" : "Lançar serviço"}
        </button>
      </form>
    </section>
  );
}

export default RealizadoForm;
