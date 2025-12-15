import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { toast } from "react-toastify";
import "./PosLogin.css";

const TOAST_ERRO_CARREGAR = "toast-erro-carregar-poslogin";

function PosLogin() {
  const { usuario, logout, setWorkspace } = useAuth();
  const navigate = useNavigate();

  const clientesPermitidos = usuario?.clientes || [];

  const [clienteId, setClienteId] = useState(
    () => localStorage.getItem("ctx_cliente_id") || ""
  );
  const [clienteNome, setClienteNome] = useState(
    () => localStorage.getItem("ctx_cliente_nome") || ""
  );

  const [fazendas, setFazendas] = useState([]);
  const [fazenda, setFazenda] = useState(
    () => localStorage.getItem("ctx_fazenda") || ""
  );

  const [safras, setSafras] = useState([]);
  const [safra, setSafra] = useState(
    () => localStorage.getItem("ctx_safra") || ""
  );

  const podeContinuar = useMemo(
    () => !!clienteId && !!fazenda && !!safra,
    [clienteId, fazenda, safra]
  );

  // 1) carrega safras + auto-seleciona cliente se só tiver 1
  useEffect(() => {
    async function carregarSafras() {
      try {
        const { data } = await api.get("/safras-lista");
        setSafras(data || []);
      } catch (err) {
        console.error(err);
        toast.error("Erro ao carregar safras.", {
          toastId: TOAST_ERRO_CARREGAR,
        });
      }
    }

    carregarSafras();

    if (!clienteId && clientesPermitidos.length === 1) {
      setClienteId(clientesPermitidos[0].id);
      setClienteNome(clientesPermitidos[0].cliente);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2) quando clienteId mudar -> busca fazendas desse cliente
  useEffect(() => {
    const cid = String(clienteId || "").trim();

    // evita chamar com "", "undefined", "null"
    if (!cid || cid === "undefined" || cid === "null") {
      setFazendas([]);
      setFazenda("");
      return;
    }

    async function carregarFazendas() {
      try {
        const { data } = await api.get("/fazendas", {
          params: { cliente_id: cid },
        });

        const lista = Array.isArray(data) ? data : [];
        setFazendas(lista);

        // se a fazenda atual não existe mais nesse cliente, reseta
        if (lista.length === 1) {
          setFazenda(lista[0].fazenda);
        } else if (!lista.some((f) => f.fazenda === fazenda)) {
          setFazenda("");
        }
      } catch (err) {
        console.error(err);
        setFazendas([]);
        setFazenda("");

        toast.error("Erro ao carregar fazendas.", {
          toastId: TOAST_ERRO_CARREGAR,
        });
      }
    }

    carregarFazendas();
    // inclui "fazenda" pra validar e resetar quando trocar cliente
  }, [clienteId]); // (se quiser, pode adicionar fazenda aqui, mas não é obrigatório)

  function continuar() {
    if (!podeContinuar) {
      toast.info("Selecione cliente, fazenda e safra para continuar.");
      return;
    }

    localStorage.setItem("ctx_cliente_id", clienteId);
    localStorage.setItem("ctx_cliente_nome", clienteNome);
    localStorage.setItem("ctx_fazenda", fazenda);
    localStorage.setItem("ctx_safra", safra);

    setWorkspace({ clienteId, clienteNome, fazenda, safra });

    navigate("/home", { replace: true });
  }

  return (
    <div className="poslogin-wrapper">
      <div className="poslogin-card">
        <h2 className="titulo-ola">Olá, {usuario?.usuario || "Usuário"}</h2>

        {/* 1) Cliente */}
        <div className="step-title">
          <div className="step-number">1</div>
          <span>Selecione o Cliente</span>
        </div>

        <div className="clientes-grid">
          {clientesPermitidos.map((c) => {
            const ativo = clienteId === c.id;
            return (
              <button
                key={c.id}
                type="button"
                className={`cliente-card ${ativo ? "ativo" : ""}`}
                onClick={() => {
                  const id = String(c.id || "").trim();
                  setClienteId(id);
                  setClienteNome(String(c.cliente || ""));
                  setFazenda("");
                  setFazendas([]);
                }}
              >
                <span className="card-title">{c.cliente}</span>
              </button>
            );
          })}
        </div>

        {/* 2) Fazenda */}
        <div className="step-title">
          <div className="step-number">2</div>
          <span>Selecione a Fazenda</span>
        </div>

        <div className="fazendas-grid">
          {fazendas.map((f) => {
            const ativo = fazenda === f.fazenda;
            return (
              <button
                key={f.id}
                type="button"
                className={`fazenda-card ${ativo ? "ativo" : ""}`}
                onClick={() => setFazenda(f.fazenda)}
              >
                <span className="card-title">{f.fazenda}</span>
              </button>
            );
          })}
        </div>

        {/* 3) Safra */}
        <div className="step-title">
          <div className="step-number">3</div>
          <span>Selecione a Safra</span>
        </div>

        <div className="safras-grid">
          {safras.map((s) => {
            const ativo = safra === s.nome;
            return (
              <button
                key={s.id}
                type="button"
                className={`safra-card ${ativo ? "ativo" : ""}`}
                onClick={() => setSafra(s.nome)}
              >
                {s.nome}
              </button>
            );
          })}
        </div>

        <button
          className="btn-continuar"
          onClick={continuar}
          type="button"
          disabled={!podeContinuar}
        >
          Continuar
        </button>
      </div>
    </div>
  );
}

export default PosLogin;
