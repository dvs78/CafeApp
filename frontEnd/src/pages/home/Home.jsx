// src/pages/home/Home.jsx
import { useNavigate } from "react-router-dom";

function Home({ usuario }) {
  const navigate = useNavigate();

  const podeVerConfiguracoes = usuario?.email === "dvs.veiga78@gmail.com";

  const nomeExibicao = usuario?.usuario || usuario?.nome || usuario?.email;

  return (
    <main className="app-main">
      <section className="card home-cards anima-card">
        <h2>Bem-vindo, {nomeExibicao}</h2>
        <p>Escolha uma área para acessar:</p>

        <div className="home-cards-grid">
          {/* CARD REALIZADO */}
          <button
            type="button"
            className="home-card home-card--realizado"
            onClick={() => navigate("/realizado")}
          >
            <h3>Realizado</h3>
            <p>Lançar e consultar serviços realizados na fazenda.</p>
          </button>

          {/* CARD CONFIGURAÇÕES - só aparece para seu email */}
          {podeVerConfiguracoes && (
            <button
              type="button"
              className="home-card home-card--config"
              onClick={() => navigate("/settings")}
            >
              <h3>Configurações</h3>
              <p>Gerenciar usuários, clientes e parâmetros do sistema.</p>
            </button>
          )}
        </div>
      </section>
    </main>
  );
}

export default Home;
