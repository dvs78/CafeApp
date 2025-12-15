import { useEffect, useState } from "react";
import api from "../../../services/api";
import { notificar } from "../../../components/Toast";

function FormUsuario({ usuario, onClose, onSaved }) {
  const editando = !!usuario?.id;

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [senha, setSenha] = useState("");
  const [senha2, setSenha2] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (editando) {
      setNome(usuario.usuario || "");
      setEmail(usuario.email || "");
      setRole(usuario.role_global || "user");
    }
  }, [editando, usuario]);

  function validar() {
    if (!nome.trim()) return "Informe o nome do usuário.";
    if (!email.trim()) return "Informe o e-mail.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      return "E-mail inválido.";
    if (!["user", "super_admin"].includes(role)) return "Permissão inválida.";

    // criação: senha obrigatória
    if (!editando) {
      if (!senha) return "Informe a senha.";
      if (senha.length < 6) return "Senha deve ter no mínimo 6 caracteres.";
      if (senha !== senha2) return "As senhas não conferem.";
    }

    // edição: senha opcional, mas se preencher tem que validar
    if (editando && senha) {
      if (senha.length < 6) return "Senha deve ter no mínimo 6 caracteres.";
      if (senha !== senha2) return "As senhas não conferem.";
    }

    return null;
  }

  async function salvar() {
    const erro = validar();
    if (erro) return notificar("erro", erro);

    setSalvando(true);
    try {
      const payload = {
        usuario: nome.trim(),
        email: email.trim().toLowerCase(),
        role_global: role,
        ...(senha ? { senha } : {}),
      };

      let resp;
      if (editando) {
        resp = await api.put(`/usuarios/${usuario.id}`, payload);
        notificar("sucesso", "Usuário atualizado.");
      } else {
        resp = await api.post("/usuarios", payload);
        notificar("sucesso", "Usuário criado.");
      }

      onSaved?.(resp.data); // ✅ aqui
      onClose?.();
    } catch (err) {
      const msg = err?.response?.data?.erro || "Erro ao salvar usuário.";
      notificar("erro", msg);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <h3>{editando ? "Editar Usuário" : "Novo Usuário"}</h3>
          <button type="button" className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <label>Nome</label>
          <input value={nome} onChange={(e) => setNome(e.target.value)} />

          <label>E-mail</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} />

          <label>Permissão</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="user">user</option>
            <option value="super_admin">super_admin</option>
          </select>

          <label>{editando ? "Nova senha (opcional)" : "Senha"}</label>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />

          <label>Confirmar senha</label>
          <input
            type="password"
            value={senha2}
            onChange={(e) => setSenha2(e.target.value)}
          />
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancelar
          </button>
          <button
            type="button"
            onClick={salvar}
            className="btn-primary"
            disabled={salvando}
          >
            {salvando ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default FormUsuario;
