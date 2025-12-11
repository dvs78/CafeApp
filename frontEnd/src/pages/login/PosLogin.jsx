// src/pages/login/PosLogin.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import "./PosLogin.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";

function PosLogin() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const [fazendas, setFazendas] = useState([]);
  const [safras, setSafras] = useState([]);

  const [fazenda, setFazenda] = useState("");
  const [safra, setSafra] = useState("");

  // ===========================
  // BUSCA FAZENDAS E SAFRAS
  // ===========================
  useEffect(() => {
    if (!usuario) return;

    async function carregar() {
      try {
        const fz = await axios.get(`/fazendas-usuario/${usuario.id}`);
        const sf = await axios.get(`/safras-lista`);

        const listaFazendas = fz.data || [];
        const listaSafras = sf.data || [];

        setFazendas(listaFazendas);
        setSafras(listaSafras);

        // Se houver apenas 1 fazenda/safra, já seleciona
        if (listaFazendas.length === 1) {
          setFazenda(listaFazendas[0].fazenda); // <- CAMPO CERTO
        }
        if (listaSafras.length === 1) {
          setSafra(listaSafras[0].nome);
        }
      } catch (err) {
        console.error("Erro ao carregar dados do PosLogin:", err);
      }
    }

    carregar();
  }, [usuario]);

  function continuar() {
    if (!fazenda || !safra) {
      return alert("Selecione a fazenda e a safra para continuar.");
    }

    // 🔒 salva o contexto escolhido
    localStorage.setItem("fazenda_nome", fazenda);
    localStorage.setItem("safra_nome", safra);

    navigate("/home");
  }

  return (
    <div className="poslogin-wrapper">
      {/* Botão logout */}
      <button className="logout-btn" onClick={logout} title="Sair">
        <FontAwesomeIcon icon={faRightFromBracket} />
      </button>

      <div className="poslogin-card">
        <h2 className="titulo-ola">Olá, {usuario?.nome || "Usuário"}</h2>
        <p className="subtitulo">
          Escolha seu ambiente de trabalho para continuar.
        </p>

        {/* STEP 1 */}
        <div className="step-title">
          <div className="step-number">1</div>
          <span>Selecione a Fazenda</span>
        </div>
        {/* <p className="step-desc">Escolha onde os serviços serão lançados.</p> */}

        <div className="fazendas-grid">
          {fazendas.map((f) => {
            const nomeFazenda = f.fazenda; // <- usa a coluna fazenda
            const ativo = fazenda === nomeFazenda;

            return (
              <button
                key={f.id}
                type="button"
                className={`fazenda-card ${ativo ? "ativo" : ""}`}
                onClick={() => setFazenda(nomeFazenda)}
              >
                <span className="card-title">{nomeFazenda}</span>
              </button>
            );
          })}
        </div>

        {/* DIVISOR */}
        <div className="divider">{/* <span>Safra</span> */}</div>

        {/* STEP 2 */}
        <div className="step-title">
          <div className="step-number">2</div>
          <span>Selecione a Safra</span>
        </div>
        {/* <p className="step-desc">Defina a safra padrão para os lançamentos.</p> */}

        <div className="safras-grid">
          {safras.map((s) => {
            const nomeSafra = s.nome;
            const ativo = safra === nomeSafra;

            return (
              <button
                key={s.id}
                type="button"
                className={`safra-card ${ativo ? "ativo" : ""}`}
                onClick={() => setSafra(nomeSafra)}
              >
                <span className="select-value">{nomeSafra}</span>
              </button>
            );
          })}
        </div>

        <button className="btn-continuar" onClick={continuar}>
          Continuar
        </button>
      </div>
    </div>
  );
}

export default PosLogin;
