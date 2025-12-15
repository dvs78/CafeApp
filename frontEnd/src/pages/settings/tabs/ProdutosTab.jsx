import { useEffect, useState } from "react";
import api from "../../../services/api";
import { notificar } from "../../../components/Toast";
import FormProduto from "../components/FormProduto";

function ProdutosTab() {
  const [produtos, setProdutos] = useState([]);
  const [abrirForm, setAbrirForm] = useState(false);
  const [editar, setEditar] = useState(null);

  const [mostrarInativos, setMostrarInativos] = useState(false);

  async function carregar() {
    try {
      const { data } = await api.get("/produtos");
      const lista = Array.isArray(data) ? data : [];
      setProdutos(lista);
    } catch {
      notificar("erro", "Erro ao carregar produtos.");
    }
  }

  useEffect(() => {
    carregar();
  }, []);

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

  async function alternarAtivo(p) {
    try {
      const { data } = await api.put(`/produtos/${p.id}`, { ativo: !p.ativo });
      setProdutos((prev) => prev.map((x) => (x.id === p.id ? data : x)));
      notificar(
        "sucesso",
        data.ativo ? "Produto ativado." : "Produto inativado."
      );
    } catch (err) {
      const msg =
        err?.response?.data?.erro || "Erro ao alterar status do produto.";
      notificar("erro", msg);
    }
  }

  const listaFiltrada = mostrarInativos
    ? produtos
    : produtos.filter((p) => p.ativo !== false);

  return (
    <>
      <div className="settings-header">
        <h2>Produtos</h2>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={mostrarInativos}
              onChange={(e) => setMostrarInativos(e.target.checked)}
            />
            Mostrar inativos
          </label>

          <button
            className="btn-primary"
            type="button"
            onClick={() => setAbrirForm(true)}
          >
            Novo Produto
          </button>
        </div>
      </div>

      <table className="settings-table">
        <thead>
          <tr>
            <th>Produto</th>
            <th width="120">Ativo</th>
            <th width="220">Ações</th>
          </tr>
        </thead>

        <tbody>
          {listaFiltrada.map((p) => (
            <tr key={p.id}>
              <td>{p.nome}</td>

              <td>{p.ativo ? "Sim" : "Não"}</td>

              <td className="acoes">
                <button type="button" onClick={() => setEditar(p)}>
                  Editar
                </button>

                <button type="button" onClick={() => alternarAtivo(p)}>
                  {p.ativo ? "Inativar" : "Ativar"}
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

          {listaFiltrada.length === 0 && (
            <tr>
              <td colSpan={3}>
                Nenhum produto {mostrarInativos ? "" : "ativo "}cadastrado.
              </td>
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
          onSaved={(salvo) => {
            setProdutos((prev) => {
              const existe = prev.some((p) => p.id === salvo.id);
              return existe
                ? prev.map((p) => (p.id === salvo.id ? salvo : p))
                : [salvo, ...prev];
            });
          }}
        />
      )}
    </>
  );
}

export default ProdutosTab;
