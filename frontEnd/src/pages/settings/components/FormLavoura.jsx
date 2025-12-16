import { useEffect, useMemo, useState } from "react";
import api from "../../../services/api";
import { notificar } from "../../../components/Toast";

function FormLavoura({ clienteId, lavoura, onClose, onSaved }) {
  const editando = !!lavoura?.id;

  const [nome, setNome] = useState("");
  const [fazendaId, setFazendaId] = useState("");
  const [fazendas, setFazendas] = useState([]);
  const [salvando, setSalvando] = useState(false);

  async function carregarFazendas(cid) {
    if (!cid) {
      setFazendas([]);
      setFazendaId("");
      return;
    }

    try {
      const { data } = await api.get("/fazendas", {
        params: { cliente_id: cid },
      });
      const lista = data || [];
      setFazendas(lista);

      // se estiver criando, escolhe a primeira
      if (!editando) {
        setFazendaId(lista[0]?.id || "");
      }
    } catch {
      notificar("erro", "Erro ao carregar fazendas do cliente.");
      setFazendas([]);
      setFazendaId("");
    }
  }

  useEffect(() => {
    carregarFazendas(clienteId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clienteId]);

  useEffect(() => {
    if (editando) {
      setNome(lavoura?.nome || "");
      setFazendaId(lavoura?.fazenda_id || "");
    } else {
      setNome("");
      // fazendaId será setado pelo carregarFazendas
    }
  }, [editando, lavoura]);

  function validar() {
    if (!clienteId) return "Selecione um cliente.";
    if (!fazendaId) return "Selecione uma fazenda.";
    if (!nome.trim()) return "Informe o nome da lavoura.";
    return null;
  }

  async function salvar() {
    const erro = validar();
    if (erro) return notificar("erro", erro);

    setSalvando(true);
    try {
      const payload = {
        nome: nome.trim(),
        cliente_id: clienteId,
        fazenda_id: fazendaId,
      };

      if (editando) {
        await api.put(`/lavouras/${lavoura.id}`, {
          nome: payload.nome,
          fazenda_id: payload.fazenda_id,
        });
        notificar("sucesso", "Lavoura atualizada.");
      } else {
        await api.post("/lavouras", payload);
        notificar("sucesso", "Lavoura criada.");
      }

      onSaved?.();
      onClose?.();
    } catch (err) {
      const msg = err?.response?.data?.erro || "Erro ao salvar lavoura.";
      notificar("erro", msg);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <h3>{editando ? "Editar Lavoura" : "Nova Lavoura"}</h3>
          <button type="button" className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <label>Fazenda</label>
          <select
            value={fazendaId}
            onChange={(e) => setFazendaId(e.target.value)}
            disabled={!clienteId || fazendas.length === 0}
          >
            {fazendas.length === 0 ? (
              <option value="">
                {clienteId
                  ? "Nenhuma fazenda para este cliente"
                  : "Selecione um cliente"}
              </option>
            ) : (
              fazendas.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.fazenda}
                </option>
              ))
            )}
          </select>

          <label>Nome</label>
          <input value={nome} onChange={(e) => setNome(e.target.value)} />
        </div>

        <div className="modal-footer">
          <button
            type="button"
            onClick={salvar}
            className="btn-primary"
            disabled={salvando}
          >
            {salvando ? "Salvando..." : "Salvar"}
          </button>

          <button type="button" onClick={onClose} className="btn-secondary">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

export default FormLavoura;
