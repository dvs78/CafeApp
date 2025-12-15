import { useEffect, useMemo, useState } from "react";
import api from "../../../services/api";
import { notificar } from "../../../components/Toast";
import FormProduto from "../components/FormProduto";

function ProdutosTab() {
  const [produtos, setProdutos] = useState([]);

  const [filtroAtivo, setFiltroAtivo] = useState("true"); // true|false|""
  const [busca, setBusca] = useState("");

  const [abrirForm, setAbrirForm] = useState(false);
  const [editar, setEditar] = useState(null);

  const params = useMemo(() => {
    const p = {};
    if (filtroAtivo === "true" || filtroAtivo === "false")
      p.ativo = filtroAtivo;
    if (busca.trim()) p.q = busca.trim();
    return p;
  }, [filtroAtivo, busca]);

  async function carregar() {
    try {
      const { data } = await api.get("/produtos", { params });
      setProdutos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      notificar("erro", "Erro ao carregar produtos.");
    }
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  async function excluir(id) {
    if (!window.confirm("Deseja excluir este produto?")) return;

    try {
      await api.delete(`/produtos/${id}`);
      setProdutos((prev) => prev.filter((p) => p.id !== id));
      notificar("sucesso", "Produto removido.");
    } catch (err) {
      const msg = err?.response?.data?.erro || "Erro ao excluir produto.";
      notificar("erro", msg);
    }
  }

  return (
    <>
      <div className="settings-topbar">
        <div className="settings-topbar-left">
          <div className="settings-topbar-title">Produtos</div>
          <div className="settings-topbar-subtitle">
            Cadastro de produtos e insumos
          </div>
        </div>

        <div className="settings-topbar-actions">
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar produto..."
          />

          <select
            value={filtroAtivo}
            onChange={(e) => setFiltroAtivo(e.target.value)}
          >
            <option value="true">Ativos</option>
            <option value="false">Inativos</option>
            <option value="">Todos</option>
          </select>

          <button
            className="btn-primary"
            type="button"
            onClick={() => setAbrirForm(true)}
          >
            Novo Produto
          </button>
        </div>
      </div>

      <div className="settings-divider" />

      <table className="settings-table">
        <thead>
          <tr>
            <th>Produto</th>
            <th width="120">Status</th>
            <th width="180">Ações</th>
          </tr>
        </thead>

        <tbody>
          {produtos.map((p) => (
            <tr key={p.id}>
              <td>{p.nome}</td>
              <td>{p.ativo ? "Ativo" : "Inativo"}</td>
              <td className="acoes">
                <button type="button" onClick={() => setEditar(p)}>
                  Editar
                </button>
                <button
                  type="button"
                  className="danger"
                  onClick={() => excluir(p.id)}
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}

          {produtos.length === 0 && (
            <tr>
              <td colSpan={3}>Nenhum produto encontrado.</td>
            </tr>
          )}
        </tbody>
      </table>

      {(abrirForm || editar) && (
        <FormProduto
          produto={editar}
          onClose={() => {
            setAbrirForm(false);
            setEditar(null);
          }}
          onSaved={() => carregar()}
        />
      )}
    </>
  );
}

export default ProdutosTab;
