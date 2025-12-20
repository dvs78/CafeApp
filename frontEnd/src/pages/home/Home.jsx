// src/pages/home/Home.jsx
import "./Home.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClipboardCheck,
  faCloudRain,
  faTemperatureHalf,
  faDroplet,
  faGear,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Home() {
  const navigate = useNavigate();
  const { usuario } = useAuth();

  // ✅ Admin: pelo seu print do banco existe role_global = "super_admin"
  const isAdmin = ["admin", "super_admin"].includes(usuario?.role_global);

  return (
    <main className="home-page">
      <section className="home-card">
        <h2 className="home-title">
          Bem-vindo, {usuario?.usuario || "Usuário"}!
        </h2>
        <p className="home-subtitle">Escolha o que deseja acessar.</p>

        <div className="home-actions">
          <button
            className="home-tile"
            onClick={() => navigate("/realizado")}
            type="button"
          >
            <div className="home-tile-left">
              <span className="home-icon">
                <FontAwesomeIcon icon={faClipboardCheck} />
              </span>

              <div>
                <div className="home-tile-title">Realizado</div>
                <div className="home-tile-desc">
                  Lançar e consultar serviços realizados.
                </div>
              </div>
            </div>
          </button>

          <button
            className="home-tile"
            onClick={() => navigate("/chuva")}
            type="button"
          >
            <div className="home-tile-left">
              <span className="home-icon">
                <FontAwesomeIcon icon={faCloudRain} />
              </span>

              <div>
                <div className="home-tile-title">Chuva</div>
                <div className="home-tile-desc">
                  Registrar e acompanhar volumes de chuva.
                </div>
              </div>
            </div>
          </button>

          <button className="home-tile" type="button" disabled>
            <div className="home-tile-left">
              <span className="home-icon">
                <FontAwesomeIcon icon={faTemperatureHalf} />
              </span>

              <div>
                <div className="home-tile-title">
                  Temperatura <span className="home-badge">Em breve</span>
                </div>
                <div className="home-tile-desc">
                  Monitorar temperaturas mínimas e máximas.
                </div>
              </div>
            </div>
          </button>

          <button className="home-tile" type="button" disabled>
            <div className="home-tile-left">
              <span className="home-icon">
                <FontAwesomeIcon icon={faDroplet} />
              </span>

              <div>
                <div className="home-tile-title">
                  Irrigação <span className="home-badge">Em breve</span>
                </div>
                <div className="home-tile-desc">
                  Controle de lâminas, turnos e aplicações.
                </div>
              </div>
            </div>
          </button>

          {isAdmin && (
            <button
              className="home-tile"
              onClick={() => navigate("/settings")}
              type="button"
            >
              <div className="home-tile-left">
                <span className="home-icon">
                  <FontAwesomeIcon icon={faGear} />
                </span>

                <div>
                  <div className="home-tile-title">Configurações</div>
                  <div className="home-tile-desc">
                    Gerenciar usuários, clientes e parâmetros do sistema.
                  </div>
                </div>
              </div>
            </button>
          )}
        </div>
      </section>
    </main>
  );
}

export default Home;
