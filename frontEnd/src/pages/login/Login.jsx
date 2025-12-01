import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const API_URL = "http://localhost:3001";

function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth(); // hook sempre no topo do componente

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      const resp = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, senha }),
      });

      const dados = await resp.json();

      if (!resp.ok) {
        setErro(dados.erro || "Usuário ou senha inválidos");
        return;
      }

      // dados.token e dados.usuario vêm da sua rota /login
      login(dados.token, dados.usuario);

      // redireciona para a home depois de logar
      navigate("/home");
    } catch (error) {
      console.error(error);
      setErro("Erro ao conectar com o servidor");
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
