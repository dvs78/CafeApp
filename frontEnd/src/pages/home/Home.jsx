import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./home.css";

function Home({ usuario }) {
  const navigate = useNavigate();

  const podeVerConfiguracoes = usuario?.email === "dvs.veiga78@gmail.com";
  const nomeExibicao = usuario?.usuario || usuario?.nome || usuario?.email;

  // estados para seleção de safra
  const [safras, setSafras] = useState([]);
  const [carregandoSafras, setCarregandoSafras] = useState(false);
  const [erroSafras, setErroSafras] = useState("");
  const [mostrarSelecaoSafra, setMostrarSelecaoSafra] = useState(false);
  const [safraSelecionada, setSafraSelecionada] = useState("");

  // carrega safras ao abrir a Home
  useEffect(() => {
    const carregarSafras = async () => {
      try {
        setCarregandoSafras(true);
        setErroSafras("");
        const res = await axios.get("/safras");
        // opcional: só safras ativas
        const lista = (res.data || []).filter((s) => s.ativo !== false);
        setSafras(lista);

        // se quiser já deixar a primeira safra marcada:
        if (lista.length > 0) {
          setSafraSelecionada(lista[0].nome);
        }
      } catch (err) {
        console.error("Erro ao carregar safras:", err);
        setErroSafras("Erro ao carregar safras.");
      } finally {
        setCarregandoSafras(false);
      }
    };

    carregarSafras();
  }, []);

  function abrirSelecaoSafra() {
    setMostrarSelecaoSafra(true);
  }

  function cancelarSelecaoSafra() {
    setMostrarSelecaoSafra(false);
  }

  function confirmarSelecaoSafra() {
    if (!safraSelecionada) {
      alert("Selecione uma safra para continuar.");
      return;
    }

    // navega para /realizado levando a safra selecionada no state
    navigate("/realizado", {
      state: { safraSelecionada },
    });
  }

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
            onClick={abrirSelecaoSafra}
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

      {/* ====== MODAL / CARD DE SELEÇÃO DE SAFRA ====== */}
      {mostrarSelecaoSafra && (
        <div className="overlay-safra">
          <div className="card selecao-safra-card anima-card">
            <h3>Selecionar safra</h3>
            <p>Escolha a safra que deseja trabalhar no lançamento:</p>

            {carregandoSafras && <p>Carregando safras...</p>}
            {erroSafras && <p className="erro-texto">{erroSafras}</p>}

            {!carregandoSafras && !erroSafras && (
              <select
                value={safraSelecionada}
                onChange={(e) => setSafraSelecionada(e.target.value)}
              >
                <option value="">Selecione a safra</option>
                {safras.map((s) => (
                  <option key={s.id} value={s.nome}>
                    {s.nome}
                  </option>
                ))}
              </select>
            )}

            <div className="selecao-safra-botoes">
              <button
                type="button"
                className="btn-secundario"
                onClick={cancelarSelecaoSafra}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-primario"
                onClick={confirmarSelecaoSafra}
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default Home;
