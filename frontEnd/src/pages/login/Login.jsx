import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

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
      const res = await api.post("/login", { email, senha });

      login(res.data.token, res.data.usuario, res.data.clientes);

      navigate("/poslogin");
    } catch (err) {
      toast.error("Usuário ou senha inválidos");
    }
  }

  // Login.jsx

  // useEffect(() => {
  //   console.log("[Login] antes:", Object.keys(localStorage));

  //   for (let i = localStorage.length - 1; i >= 0; i--) {
  //     const k = localStorage.key(i);
  //     if (k?.startsWith("ctx_") || k?.startsWith("cb_")) {
  //       localStorage.removeItem(k);
  //     }
  //   }

  //   console.log("[Login] depois:", Object.keys(localStorage));
  //   console.log(
  //     "[Login] ctx_fazenda_id =",
  //     localStorage.getItem("ctx_fazenda_id")
  //   );
  // }, []);

  return (
    <div className="page__login">
      <div className="card__login">
        <h2>LOGIN</h2>
        <p className="login-subtitle">Acesse para lançar os dados da fazenda</p>

        <form onSubmit={handleSubmit}>
          <div className="label-input__container-bloco">
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="label-input__container-bloco">
            <label className="label">Senha</label>
            <input
              className="input"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>

          <button type="submit" className="btn__sucesso">
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
