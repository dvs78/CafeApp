// src/pages/login/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();

    if (!email || !senha) {
      toast.error("Informe email e senha");
      return;
    }

    try {
      const res = await api.post("/login", { email, senha });
      login(res.data.token, res.data.usuario, res.data.clientes);
      navigate("/poslogin");
    } catch {
      toast.error("Usuário ou senha inválidos");
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h2>Login</h2>
          <span className="login-badge">Cafeicultura</span>
        </div>

        <p className="login-subtitle">
          Acesse para lançar os dados da fazenda.
        </p>

        <form onSubmit={handleSubmit} className="login-form">
          {/* EMAIL */}
          <div className="login-field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
            />
          </div>

          {/* SENHA */}
          <div className="login-field">
            <label>Senha</label>

            <div className="login-password-wrapper">
              <input
                type={mostrarSenha ? "text" : "password"}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
              />

              <button
                type="button"
                className="login-eye"
                onClick={() => setMostrarSenha((v) => !v)}
                aria-label="Mostrar senha"
              >
                <FontAwesomeIcon icon={mostrarSenha ? faEyeSlash : faEye} />
              </button>
            </div>
          </div>

          <button type="submit" className="login-btn">
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
