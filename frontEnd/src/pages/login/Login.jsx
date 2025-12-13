import { useState } from "react";
import { useNavigate } from "react-router-dom";
// import axios from "axios";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();

    if (!email || !senha) {
      toast.error("Informe email e senha");
      return;
    }

    try {
      // const res = await axios.post("/login", { email, senha });
      const res = await api.post("/login", { email, senha });

      login(res.data.token, res.data.usuario);
      navigate("/poslogin");
    } catch (err) {
      toast.error("Usuário ou senha inválidos");
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h2 className="login-title">Entrar</h2>
        <p className="login-subtitle">Acesse para lançar os dados da fazenda</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-campo">
            <label className="login-label">Email</label>
            <input
              className="login-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="login-campo">
            <label className="login-label">Senha</label>
            <input
              className="login-input"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>

          <button type="submit" className="btn-entrar">
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
