import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Home.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClipboardCheck,
  faGear,
  faArrowRight,
  faCloudRain,
  faTemperatureHigh,
  faDroplet,
} from "@fortawesome/free-solid-svg-icons";

function Home() {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const nome = usuario?.usuario || "Usuário";
  const isAdmin = usuario?.role === "admin"; // ou usuario?.is_admin === true

  return (
    <div className="home-page">
      <div className="home-card">
        <h2 className="home-title">Bem-vindo, {nome}!</h2>
        <p className="home-subtitle">Escolha o que deseja acessar.</p>

        <div className="home-actions">
          {/* REALIZADO */}
          <button className="home-tile" onClick={() => navigate("/realizado")}>
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

          {/* CHUVA */}
          <button className="home-tile" onClick={() => navigate("/chuva")}>
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

          {/* TEMPERATURA */}
          <button
            className="home-tile"
            onClick={() => navigate("/temperatura")}
          >
            <div className="home-tile-left">
              <span className="home-icon">
                <FontAwesomeIcon icon={faTemperatureHigh} />
              </span>
              <div>
                <div className="home-tile-title">Temperatura</div>
                <div className="home-tile-desc">
                  Monitorar temperaturas mínimas e máximas.
                </div>
              </div>
            </div>
          </button>

          {/* IRRIGAÇÃO */}
          <button className="home-tile" onClick={() => navigate("/irrigacao")}>
            <div className="home-tile-left">
              <span className="home-icon">
                <FontAwesomeIcon icon={faDroplet} />
              </span>
              <div>
                <div className="home-tile-title">Irrigação</div>
                <div className="home-tile-desc">
                  Controle de lâminas, turnos e aplicações.
                </div>
              </div>
            </div>
          </button>

          {/* CONFIGURAÇÕES (ADMIN) */}
          {isAdmin && (
            <button className="home-tile" onClick={() => navigate("/settings")}>
              <div className="home-tile-left">
                <span className="home-icon home-icon--soft">
                  <FontAwesomeIcon icon={faGear} />
                </span>
                <div>
                  <div className="home-tile-title">
                    Configurações <span className="home-badge">Admin</span>
                  </div>
                  <div className="home-tile-desc">
                    Ajustes do sistema e preferências.
                  </div>
                </div>
              </div>
              <span className="home-arrow">
                <FontAwesomeIcon icon={faArrowRight} />
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
