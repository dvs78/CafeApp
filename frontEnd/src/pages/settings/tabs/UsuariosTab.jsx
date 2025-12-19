import { useEffect, useState } from "react";
import api from "../../../services/api";
import { notificar } from "../../../components/Toast";
import FormUsuario from "../components/FormUsuario";
import { useAuth } from "../../../context/AuthContext";
import ConfirmDialog from "../../../components/ConfirmDialog/ConfirmDialog";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash } from "@fortawesome/free-solid-svg-icons";

function UsuariosTab() {
  const { usuario: usuarioLogado } = useAuth();

  const [usuarios, setUsuarios] = useState([]);
  const [abrirForm, setAbrirForm] = useState(false);
  const [editar, setEditar] = useState(null);

  // -------------------------
  // CONFIRM DIALOG (EXCLUIR)
  // -------------------------
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [usuarioParaExcluir, setUsuarioParaExcluir] = useState(null);

  async function carregar() {
    try {
      const { data } = await api.get("/usuarios");
      setUsuarios(Array.isArray(data) ? data : []);
    } catch {
      notificar("erro", "Erro ao carregar usuários.");
      setUsuarios([]);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  function abrirConfirmExcluir(u) {
    setUsuarioParaExcluir({ id: u.id, usuario: u.usuario });
    setConfirmOpen(true);
  }

  function fecharConfirmExcluir() {
    setConfirmOpen(false);
    setUsuarioParaExcluir(null);
  }

  async function confirmarExcluir() {
    const id = usuarioParaExcluir?.id;
    if (!id) return;

    try {
      await api.delete(`/usuarios/${id}`);
      setUsuarios((prev) => prev.filter((u) => u.id !== id));
      notificar("sucesso", "Usuário removido.");
    } catch (err) {
      const msg = err?.response?.data?.erro || "Erro ao excluir usuário.";
      notificar("erro", msg);
    } finally {
      fecharConfirmExcluir();
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
            const ehEu = String(usuarioLogado?.id) === String(u.id);

            return (
              <tr key={u.id}>
                <td>{u.usuario}</td>
                <td>{u.email}</td>
                <td>{u.role_global}</td>

                <td className="acoes">
                  <button
                    className="acao editar"
                    type="button"
                    title="Editar usuário"
                    onClick={() => setEditar(u)}
                  >
                    <FontAwesomeIcon icon={faPen} />
                  </button>

                  <button
                    className="acao danger"
                    type="button"
                    disabled={ehEu}
                    title={
                      ehEu
                        ? "Você não pode excluir o seu próprio usuário."
                        : "Excluir usuário"
                    }
                    onClick={() => {
                      if (!ehEu) abrirConfirmExcluir(u);
                    }}
                    style={
                      ehEu
                        ? { opacity: 0.45, cursor: "not-allowed" }
                        : undefined
                    }
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </td>
              </tr>
            );
          })}

          {usuarios.length === 0 && (
            <tr>
              <td colSpan={4}>Nenhum usuário cadastrado.</td>
            </tr>
          )}
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

      <ConfirmDialog
        open={confirmOpen}
        title="Excluir usuário"
        description={
          usuarioParaExcluir
            ? `Tem certeza que deseja excluir o usuário "${usuarioParaExcluir.usuario}"?\nEsta ação não pode ser desfeita.`
            : ""
        }
        confirmLabel="Confirmar"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={confirmarExcluir}
        onCancel={fecharConfirmExcluir}
      />
    </>
  );
}

export default UsuariosTab;
