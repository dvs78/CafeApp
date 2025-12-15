import { useEffect, useState } from "react";
import api from "../../../services/api";
import { notificar } from "../../../components/Toast";
import FormSafra from "../components/FormSafra";

function SafrasTab() {
  const [safras, setSafras] = useState([]);
  const [abrirForm, setAbrirForm] = useState(false);
  const [editar, setEditar] = useState(null);

  async function carregar() {
    try {
      const { data } = await api.get("/safras-lista");
      setSafras(data || []);
    } catch {
      notificar("erro", "Erro ao carregar safras.");
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function excluir(id) {
    if (!window.confirm("Deseja excluir esta safra?")) return;

    try {
      await api.delete(`/safras-lista/${id}`);
      setSafras((prev) => prev.filter((s) => s.id !== id));
      notificar("sucesso", "Safra removida.");
    } catch (err) {
      const msg = err?.response?.data?.erro || "Erro ao excluir safra.";
      notificar("erro", msg);
    }
  }

  return (
    <>
      <div className="settings-header">
        <h2>Safras</h2>
        <button
          className="btn-primary"
          type="button"
          onClick={() => setAbrirForm(true)}
        >
          Nova Safra
        </button>
      </div>

      <table className="settings-table">
        <thead>
          <tr>
            <th>Safra</th>
            <th width="160">Ações</th>
          </tr>
        </thead>

        <tbody>
          {safras.map((s) => (
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

          {safras.length === 0 && (
            <tr>
              <td colSpan={2}>Nenhuma safra cadastrada.</td>
            </tr>
          )}
        </tbody>
      </table>

      {(abrirForm || editar) && (
        <FormSafra
          safra={editar}
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

export default SafrasTab;
