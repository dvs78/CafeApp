import { useEffect, useState } from "react";
import api from "../../../services/api";
import { notificar } from "../../../components/Toast";
import FormUsuario from "../components/FormUsuario";
import { useAuth } from "../../../context/AuthContext"; // ajuste caminho conforme seu projeto

function UsuariosTab() {
  const { usuario: usuarioLogado } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [abrirForm, setAbrirForm] = useState(false);
  const [editar, setEditar] = useState(null);

  async function carregar() {
    try {
      const { data } = await api.get("/usuarios");
      setUsuarios(data || []);
    } catch {
      notificar("erro", "Erro ao carregar usuários.");
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function excluir(id) {
    if (!window.confirm("Deseja excluir este usuário?")) return;

    try {
      await api.delete(`/usuarios/${id}`);
      setUsuarios((prev) => prev.filter((u) => u.id !== id));
      notificar("sucesso", "Usuário removido.");
    } catch (err) {
      const msg = err?.response?.data?.erro || "Erro ao excluir usuário.";
      notificar("erro", msg);
    }
  }

  return (
    <>
      <div className="settings-header">
        <h2>Usuários</h2>
        <button
          className="btn-primary"
          type="button"
          onClick={() => setAbrirForm(true)}
        >
          Novo Usuário
        </button>
      </div>

      <table className="settings-table">
        <thead>
          <tr>
            <th>Usuário</th>
            <th>E-mail</th>
            <th>Permissão</th>
            <th width="180">Ações</th>
          </tr>
        </thead>

        <tbody>
          {usuarios.map((u) => {
            const ehEu = usuarioLogado?.id === u.id;

            return (
              <tr key={u.id}>
                <td>{u.usuario}</td>
                <td>{u.email}</td>
                <td>{u.role_global}</td>
                <td className="acoes">
                  <button type="button" onClick={() => setEditar(u)}>
                    Editar
                  </button>

                  <button
                    type="button"
                    className="danger"
                    onClick={() => excluir(u.id)}
                    disabled={ehEu}
                    title={
                      ehEu ? "Você não pode excluir o seu próprio usuário." : ""
                    }
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {(abrirForm || editar) && (
        <FormUsuario
          usuario={editar}
          onClose={() => {
            setAbrirForm(false);
            setEditar(null);
          }}
          onSaved={(salvo) => {
            setUsuarios((prev) => {
              const existe = prev.some((u) => u.id === salvo.id);
              return existe
                ? prev.map((u) => (u.id === salvo.id ? salvo : u))
                : [salvo, ...prev];
            });
          }}
        />
      )}
    </>
  );
}

export default UsuariosTab;
