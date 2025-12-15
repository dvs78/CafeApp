import { useEffect, useState } from "react";
import api from "../../../services/api";
import { notificar } from "../../../components/Toast";
import FormServico from "../components/FormServico";

function ServicosTab() {
  const [servicos, setServicos] = useState([]);
  const [abrirForm, setAbrirForm] = useState(false);
  const [editar, setEditar] = useState(null);

  async function carregar() {
    try {
      const { data } = await api.get("/servicos-lista");
      setServicos(data || []);
    } catch {
      notificar("erro", "Erro ao carregar serviços.");
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function excluir(id) {
    if (!window.confirm("Deseja excluir este serviço?")) return;

    try {
      await api.delete(`/servicos-lista/${id}`);
      setServicos((prev) => prev.filter((s) => s.id !== id));
      notificar("sucesso", "Serviço removido.");
    } catch (err) {
      const msg = err?.response?.data?.erro || "Erro ao excluir serviço.";
      notificar("erro", msg);
    }
  }

  return (
    <>
      <div className="settings-header">
        <h2>Serviços</h2>
        <button
          className="btn-primary"
          type="button"
          onClick={() => setAbrirForm(true)}
        >
          Novo Serviço
        </button>
      </div>

      <table className="settings-table">
        <thead>
          <tr>
            <th>Serviço</th>
            <th width="160">Ações</th>
          </tr>
        </thead>

        <tbody>
          {servicos.map((s) => (
            <tr key={s.id}>
              <td>{s.nome}</td>
              <td className="acoes">
                <button type="button" onClick={() => setEditar(s)}>
                  Editar
                </button>
                <button
                  type="button"
                  className="danger"
                  onClick={() => excluir(s.id)}
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}

          {servicos.length === 0 && (
            <tr>
              <td colSpan={2}>Nenhum serviço cadastrado.</td>
            </tr>
          )}
        </tbody>
      </table>

      {(abrirForm || editar) && (
        <FormServico
          servico={editar}
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

export default ServicosTab;
