import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";

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
    // limpa storage do contexto
    localStorage.removeItem("ctx_cliente_id");
    localStorage.removeItem("ctx_cliente_nome");
    localStorage.removeItem("ctx_fazenda");
    localStorage.removeItem("ctx_fazenda_id");
    localStorage.removeItem("ctx_safra");
    localStorage.removeItem("ctx_safra_id");

    // limpa estados
    setClienteId("");
    setClienteNome("");
    setFazendaId("");
    setFazendas([]);
    setFazenda("");

    setSafra("");
    setSafraId("");

    // zera também no contexto global (evita RequireWorkspace redirecionar errado)
    setWorkspace(null);

    toast.info("Seleções limpas.");
  }

  const podeContinuar = useMemo(
    () => !!clienteId && !!fazendaId && !!fazenda && !!safraId,
    [clienteId, fazendaId, fazenda, safraId]
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

        // 🔥 restaura seleção salva
        const fazendaSalva = localStorage.getItem("ctx_fazenda");
        const fazendaIdSalva = localStorage.getItem("ctx_fazenda_id");

        if (
          fazendaSalva &&
          fazendaIdSalva &&
          lista.some((f) => String(f.id) === fazendaIdSalva)
        ) {
          setFazenda(fazendaSalva);
          setFazendaId(fazendaIdSalva);
        } else if (lista.length === 1) {
          setFazenda(lista[0].fazenda);
          setFazendaId(String(lista[0].id));
        } else {
          setFazenda("");
          setFazendaId("");
        }
      } catch (err) {
        console.error(err);
        setFazendas([]);
        setFazenda("");
        setFazendaId("");
      }
    }

    carregarFazendas();
  }, [clienteId]);

  function continuar() {
    if (!clienteId) return toast.info("Selecione o cliente para continuar.");
    if (!fazenda) return toast.info("Selecione a fazenda para continuar.");
    if (!safra) return toast.info("Selecione a safra para continuar.");

    localStorage.setItem("ctx_cliente_id", clienteId);
    localStorage.setItem("ctx_cliente_nome", clienteNome);
    localStorage.setItem("ctx_fazenda", fazenda);
    localStorage.setItem("ctx_fazenda_id", fazendaId);
    localStorage.setItem("ctx_safra", safra);
    localStorage.setItem("ctx_safra_id", safraId);

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
        <div className="card__titulo-btn">
          <h2 className="titulo-ola">Olá, {usuario?.usuario || "Usuário"}</h2>
          <button
            type="button"
            className="icon__logout"
            onClick={() => {
              logout();
              navigate("/login", { replace: true });
            }}
            title="Sair"
          >
            <FontAwesomeIcon icon={faRightFromBracket} />
          </button>
        </div>

        {/* Cliente */}
        <div className="grupo__container-select">
          <label className="label">Selecione o Cliente</label>

          <div className="label-input__container-select">
            {clientesPermitidos.map((c) => {
              const ativo = String(clienteId) === String(c.id);

              return (
                <button
                  key={c.id}
                  type="button"
                  className={`select__card ${ativo ? "ativo" : ""}`}
                  onClick={() => {
                    const id = String(c.id || "").trim();

                    // 👉 se clicou no MESMO cliente, não faz nada
                    if (String(clienteId) === id) return;

                    // troca real de cliente → limpa dependências
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
                  <div className="select__card--title">{c.cliente}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2) Fazenda */}

        <div className="grupo__container-select">
          {clienteId && (
            <>
              <label className="label">Selecione a Fazenda</label>
              <div className="label-input__container-select">
                {fazendas.map((f) => {
                  const ativo = fazenda === f.fazenda;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      className={`select__card ${ativo ? "ativo" : ""}`}
                      onClick={() => {
                        localStorage.removeItem("ctx_fazenda");
                        localStorage.removeItem("ctx_fazenda_id");
                        localStorage.removeItem("ctx_safra");
                        localStorage.removeItem("ctx_safra_id");

                        setFazenda(f.fazenda);
                        setFazendaId(String(f.id));
                        setSafra("");
                        setSafraId("");
                      }}
                    >
                      <div className="select__card--title">{f.fazenda}</div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* 3) Safra (só aparece depois de selecionar a fazenda) */}
        {fazendaId && (
          <>
            <div className="grupo__container-select">
              <label className="label">Selecione a Safra</label>
              <div className="label-input__container-select">
                {safras.map((s) => {
                  const ativo = safra === s.nome;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      className={`select__card ${ativo ? "ativo" : ""}`}
                      onClick={() => {
                        setSafra(s.nome);
                        setSafraId(String(s.id));
                      }}
                    >
                      {s.nome}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {safraId && (
          <>
            <button className="btn__sucesso" onClick={continuar} type="button">
              Continuar
            </button>

            <button
              className="btn__cancelar"
              onClick={limparCampos}
              type="button"
            >
              Limpar campos
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default PosLogin;
