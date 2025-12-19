// PosLogin.css
// src/pages/login/PosLogin.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { toast } from "react-toastify";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";

import "./PosLogin.css";

const TOAST_ERRO_CARREGAR = "toast-erro-carregar-poslogin";

function PosLogin() {
  const { usuario, clientes, logout, setWorkspace } = useAuth();
  const clientesPermitidos = clientes || [];
  const navigate = useNavigate();

  const [clienteId, setClienteId] = useState(
    () => localStorage.getItem("ctx_cliente_id") || ""
  );
  const [clienteNome, setClienteNome] = useState(
    () => localStorage.getItem("ctx_cliente_nome") || ""
  );

  const [fazendaId, setFazendaId] = useState(
    () => localStorage.getItem("ctx_fazenda_id") || ""
  );
  const [fazendas, setFazendas] = useState([]);
  const [fazenda, setFazenda] = useState(
    () => localStorage.getItem("ctx_fazenda") || ""
  );

  const [safraId, setSafraId] = useState(
    () => localStorage.getItem("ctx_safra_id") || ""
  );
  const [safras, setSafras] = useState([]);
  const [safra, setSafra] = useState(
    () => localStorage.getItem("ctx_safra") || ""
  );

  function limparCampos() {
    localStorage.removeItem("ctx_cliente_id");
    localStorage.removeItem("ctx_cliente_nome");
    localStorage.removeItem("ctx_fazenda");
    localStorage.removeItem("ctx_fazenda_id");
    localStorage.removeItem("ctx_safra");
    localStorage.removeItem("ctx_safra_id");

    setClienteId("");
    setClienteNome("");
    setFazendaId("");
    setFazendas([]);
    setFazenda("");
    setSafra("");
    setSafraId("");

    setWorkspace(null);
    toast.info("Seleções limpas.");
  }

  const podeContinuar = useMemo(
    () => !!clienteId && !!fazendaId && !!fazenda && !!safraId,
    [clienteId, fazendaId, fazenda, safraId]
  );

  // Safras + auto cliente se só tiver 1
  useEffect(() => {
    async function carregarSafras() {
      try {
        const { data } = await api.get("/safras-lista");
        setSafras(Array.isArray(data) ? data : []);
      } catch {
        toast.error("Erro ao carregar safras.", {
          toastId: TOAST_ERRO_CARREGAR,
        });
      }
    }

    carregarSafras();

    if (!clienteId && clientesPermitidos.length === 1) {
      setClienteId(String(clientesPermitidos[0].id));
      setClienteNome(String(clientesPermitidos[0].cliente || ""));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fazendas quando muda cliente
  useEffect(() => {
    const cid = String(clienteId || "").trim();

    if (!cid) {
      setFazendas([]);
      setFazenda("");
      setFazendaId("");
      return;
    }

    async function carregarFazendas() {
      try {
        const { data } = await api.get("/fazendas", {
          params: { cliente_id: cid },
        });
        const lista = Array.isArray(data) ? data : [];
        setFazendas(lista);

        const fazendaSalva = localStorage.getItem("ctx_fazenda");
        const fazendaIdSalva = localStorage.getItem("ctx_fazenda_id");

        if (
          fazendaSalva &&
          fazendaIdSalva &&
          lista.some((f) => String(f.id) === String(fazendaIdSalva))
        ) {
          setFazenda(String(fazendaSalva));
          setFazendaId(String(fazendaIdSalva));
        } else if (lista.length === 1) {
          setFazenda(String(lista[0].fazenda || ""));
          setFazendaId(String(lista[0].id));
        } else {
          setFazenda("");
          setFazendaId("");
        }
      } catch {
        setFazendas([]);
        setFazenda("");
        setFazendaId("");
      }
    }

    carregarFazendas();
  }, [clienteId]);

  function continuar() {
    if (!clienteId) return toast.info("Selecione o cliente para continuar.");
    if (!fazendaId) return toast.info("Selecione a fazenda para continuar.");
    if (!safraId) return toast.info("Selecione a safra para continuar.");

    localStorage.setItem("ctx_cliente_id", String(clienteId));
    localStorage.setItem("ctx_cliente_nome", String(clienteNome));
    localStorage.setItem("ctx_fazenda", String(fazenda));
    localStorage.setItem("ctx_fazenda_id", String(fazendaId));
    localStorage.setItem("ctx_safra", String(safra));
    localStorage.setItem("ctx_safra_id", String(safraId));

    setWorkspace({
      clienteId,
      clienteNome,
      fazenda,
      fazendaId,
      safra,
      safraId,
    });

    navigate("/home", { replace: true });
  }

  return (
    <div className="page__poslogin">
      <div className="card__poslogin">
        {/* Topo */}
        <div className="poslogin__top">
          <div>
            <h2 className="poslogin__title">
              Olá, {usuario?.usuario || "Usuário"}
            </h2>
            <p className="poslogin__subtitle">
              Escolha o cliente, fazenda e safra para continuar.
            </p>
          </div>

          <button
            type="button"
            className="poslogin__logout"
            onClick={() => {
              logout();
              navigate("/login", { replace: true });
            }}
            title="Sair"
            aria-label="Sair"
          >
            <FontAwesomeIcon icon={faRightFromBracket} />
          </button>
        </div>

        {/* Cliente */}
        <div className="poslogin__section">
          <div className="poslogin__sectionTitle">
            <span className="poslogin__dot poslogin__dot--green" />
            <h3>Cliente</h3>
          </div>

          <div className="poslogin__grid">
            {clientesPermitidos.map((c) => {
              const ativo = String(clienteId) === String(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  className={`poslogin__chip ${ativo ? "is-active" : ""}`}
                  onClick={() => {
                    const id = String(c.id || "").trim();
                    if (String(clienteId) === id) return;

                    localStorage.removeItem("ctx_fazenda");
                    localStorage.removeItem("ctx_fazenda_id");
                    localStorage.removeItem("ctx_safra");
                    localStorage.removeItem("ctx_safra_id");

                    setClienteId(id);
                    setClienteNome(String(c.cliente || ""));
                    setFazenda("");
                    setFazendaId("");
                    setSafra("");
                    setSafraId("");
                    setFazendas([]);
                  }}
                >
                  {c.cliente}
                </button>
              );
            })}
          </div>
        </div>

        {/* Fazenda */}
        {clienteId && (
          <div className="poslogin__section">
            <div className="poslogin__sectionTitle">
              <span className="poslogin__dot poslogin__dot--yellow" />
              <h3>Fazenda</h3>
            </div>

            <div className="poslogin__grid">
              {fazendas.map((f) => {
                const ativo = String(fazendaId) === String(f.id);
                return (
                  <button
                    key={f.id}
                    type="button"
                    className={`poslogin__chip ${ativo ? "is-active" : ""}`}
                    onClick={() => {
                      setFazenda(String(f.fazenda || ""));
                      setFazendaId(String(f.id));
                      setSafra("");
                      setSafraId("");
                    }}
                  >
                    {f.fazenda}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Safra */}
        {fazendaId && (
          <div className="poslogin__section">
            <div className="poslogin__sectionTitle">
              <span className="poslogin__dot poslogin__dot--red" />
              <h3>Safra</h3>
            </div>

            <div className="poslogin__grid">
              {safras.map((s) => {
                const ativo = String(safraId) === String(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    className={`poslogin__chip ${ativo ? "is-active" : ""}`}
                    onClick={() => {
                      setSafra(String(s.nome || ""));
                      setSafraId(String(s.id));
                    }}
                  >
                    {s.nome}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Ações */}
        <div className="poslogin__actions">
          <button
            className="poslogin__btn poslogin__btn--primary"
            onClick={continuar}
            type="button"
            disabled={!podeContinuar}
          >
            Continuar
          </button>

          <button
            className="poslogin__btn poslogin__btn--ghost"
            onClick={limparCampos}
            type="button"
          >
            Limpar campos
          </button>
        </div>
      </div>
    </div>
  );
}

export default PosLogin;
