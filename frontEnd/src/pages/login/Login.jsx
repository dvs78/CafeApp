// src/pages/login/Login.jsx
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      // axios já usa axios.defaults.baseURL configurado no App.jsx
      const resp = await axios.post("/login", {
        email,
        senha,
      });

      const { token, usuario } = resp.data;

      // 🔐 GUARDA NO LOCALSTORAGE (usado pelo Realizado.jsx)
      localStorage.setItem("token", token);
      localStorage.setItem("usuario", JSON.stringify(usuario));

      // Atualiza o contexto de autenticação
      login(token, usuario);

      // Vai para a home
      navigate("/poslogin");
    } catch (err) {
      console.error(err);

      if (err.response) {
        setErro(err.response.data.erro || "Usuário ou senha inválidos");
      } else {
        setErro("Erro ao conectar com o servidor");
      }
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card card anima-card">
        <h2>Entrar</h2>
        <p className="login-subtitle">
          Acesse para lançar os serviços da cafeicultura ☕
        </p>

        <form onSubmit={handleSubmit} className="form-servico">
          <div className="campo">
            <label>Email</label>
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="campo">
            <label>Senha</label>
            <input
              type="password"
              placeholder="Sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>

          {erro && <p className="mensagem-erro">{erro}</p>}

          <button className="btn-primario" disabled={carregando}>
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
