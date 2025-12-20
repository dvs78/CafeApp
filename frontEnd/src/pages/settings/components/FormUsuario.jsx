import { useEffect, useState } from "react";
import api from "../../../services/api";
import { notificar } from "../../../components/Toast";
import FormModal from "./FormModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";

function FormUsuario({ usuario, onClose, onSaved }) {
  const editando = Boolean(usuario?.id);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [senha, setSenha] = useState("");
  const [senha2, setSenha2] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [verSenha, setVerSenha] = useState(false);
  const [verSenha2, setVerSenha2] = useState(false);

  useEffect(() => {
    if (editando) {
      setNome(usuario?.usuario || "");
      setEmail(usuario?.email || "");
      setRole(usuario?.role_global || "user");
      setSenha("");
      setSenha2("");
    } else {
      setNome("");
      setEmail("");
      setRole("user");
      setSenha("");
      setSenha2("");
    }
  }, [editando, usuario]);

  function validar() {
    const nomeLimpo = (nome || "").trim();
    const emailLimpo = (email || "").trim().toLowerCase();

    if (!nomeLimpo) return "Informe o nome do usuário.";
    if (!emailLimpo) return "Informe o e-mail.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpo))
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
        usuario: (nome || "").trim(),
        email: (email || "").trim().toLowerCase(),
        role_global: role,
        ...(senha ? { senha } : {}),
      };

      const resp = editando
        ? await api.put(`/usuarios/${usuario.id}`, payload)
        : await api.post("/usuarios", payload);

      notificar(
        "sucesso",
        editando ? "Usuário atualizado." : "Usuário criado."
      );
      onSaved?.(resp?.data);
      onClose?.();
    } catch (err) {
      const msg = err?.response?.data?.erro || "Erro ao salvar usuário.";
      notificar("erro", msg);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <FormModal
      title={editando ? "Editar Usuário" : "Novo Usuário"}
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            className="btn-primary"
            onClick={salvar}
            disabled={salvando}
          >
            {salvando ? "Salvando..." : "Salvar"}
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            disabled={salvando}
          >
            Cancelar
          </button>
        </>
      }
    >
      <div className="form-grid">
        <div className="form-field">
          <label>Nome</label>
          <input
            className="form-control"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome do usuário"
            autoComplete="name"
          />
        </div>

        <div className="form-field">
          <label>E-mail</label>
          <input
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@exemplo.com"
            inputMode="email"
            autoComplete="email"
          />
        </div>

        <div className="form-field">
          <label>Permissão</label>

          <div className="form-select-wrapper">
            <select
              className="form-control"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="user">user</option>
              <option value="super_admin">super_admin</option>
            </select>

            <FontAwesomeIcon icon={faChevronDown} className="select-icon" />
          </div>
        </div>

        <div className="form-field">
          <label>{editando ? "Nova senha (opcional)" : "Senha"}</label>

          <div className="form-input-wrapper">
            <input
              className="form-control"
              type={verSenha ? "text" : "password"}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              autoComplete="new-password"
            />

            <button
              type="button"
              className="input-icon-btn"
              onClick={() => setVerSenha((v) => !v)}
              aria-label={verSenha ? "Ocultar senha" : "Mostrar senha"}
              title={verSenha ? "Ocultar senha" : "Mostrar senha"}
            >
              <FontAwesomeIcon icon={verSenha ? faEyeSlash : faEye} />
            </button>
          </div>
        </div>

        <div className="form-field">
          <label>Confirmar senha</label>

          <div className="form-input-wrapper">
            <input
              className="form-control"
              type={verSenha2 ? "text" : "password"}
              value={senha2}
              onChange={(e) => setSenha2(e.target.value)}
              autoComplete="new-password"
            />

            <button
              type="button"
              className="input-icon-btn"
              onClick={() => setVerSenha2((v) => !v)}
              aria-label={verSenha2 ? "Ocultar senha" : "Mostrar senha"}
              title={verSenha2 ? "Ocultar senha" : "Mostrar senha"}
            >
              <FontAwesomeIcon icon={verSenha2 ? faEyeSlash : faEye} />
            </button>
          </div>
        </div>
      </div>
    </FormModal>
  );
}

export default FormUsuario;
