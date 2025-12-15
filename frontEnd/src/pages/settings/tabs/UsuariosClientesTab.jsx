import { useEffect, useMemo, useState } from "react";
import api from "../../../services/api";
import { notificar } from "../../../components/Toast";

function UsuariosClientesTab() {
  const [usuarios, setUsuarios] = useState([]);
  const [clientes, setClientes] = useState([]);

  const [usuarioId, setUsuarioId] = useState("");
  const [vinculados, setVinculados] = useState([]);
  const [clienteParaVincular, setClienteParaVincular] = useState("");

  async function carregarBase() {
    try {
      const [u, c] = await Promise.all([
        api.get("/usuarios"),
        api.get("/clientes"),
      ]);
      setUsuarios(u.data || []);
      setClientes(c.data || []);
      if (!usuarioId && (u.data || []).length) setUsuarioId(u.data[0].id);
    } catch {
      notificar("erro", "Erro ao carregar usuários/clientes.");
    }
  }

  async function carregarVinculos(uid) {
    if (!uid) {
      setVinculados([]);
      return;
    }
    try {
      const { data } = await api.get(`/usuarios-clientes/${uid}`);
      setVinculados(data || []);
    } catch {
      notificar("erro", "Erro ao carregar vínculos.");
    }
  }

  useEffect(() => {
    carregarBase();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    carregarVinculos(usuarioId);
    setClienteParaVincular("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuarioId]);

  const clientesDisponiveis = useMemo(() => {
    const setIds = new Set(vinculados.map((v) => String(v.id)));
    return clientes.filter((c) => !setIds.has(String(c.id)));
  }, [clientes, vinculados]);

  async function vincular() {
    if (!usuarioId || !clienteParaVincular) {
      return notificar("erro", "Selecione usuário e cliente.");
    }

    try {
      await api.post("/usuarios-clientes", {
        usuario_id: usuarioId,
        cliente_id: clienteParaVincular,
      });
      notificar("sucesso", "Vínculo criado.");
      carregarVinculos(usuarioId);
      setClienteParaVincular("");
    } catch {
      notificar("erro", "Erro ao vincular.");
    }
  }

  async function remover(clienteId) {
    if (!window.confirm("Remover vínculo deste cliente?")) return;

    try {
      await api.delete("/usuarios-clientes", {
        data: { usuario_id: usuarioId, cliente_id: clienteId },
      });
      notificar("sucesso", "Vínculo removido.");
      setVinculados((prev) =>
        prev.filter((c) => String(c.id) !== String(clienteId))
      );
    } catch {
      notificar("erro", "Erro ao remover vínculo.");
    }
  }

  return (
    <>
      <div className="settings-header">
        <h2>Usuários x Clientes</h2>

        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <select
            value={usuarioId}
            onChange={(e) => setUsuarioId(e.target.value)}
          >
            {usuarios.map((u) => (
              <option key={u.id} value={u.id}>
                {u.usuario} ({u.email})
              </option>
            ))}
          </select>

          <select
            value={clienteParaVincular}
            onChange={(e) => setClienteParaVincular(e.target.value)}
            disabled={!usuarioId}
          >
            <option value="">Selecione um cliente...</option>
            {clientesDisponiveis.map((c) => (
              <option key={c.id} value={c.id}>
                {c.cliente}
              </option>
            ))}
          </select>

          <button
            className="btn-primary"
            type="button"
            onClick={vincular}
            disabled={!clienteParaVincular}
          >
            Vincular
          </button>
        </div>
      </div>

      <table className="settings-table">
        <thead>
          <tr>
            <th>Clientes vinculados</th>
            <th width="160">Ações</th>
          </tr>
        </thead>
        <tbody>
          {vinculados.map((c) => (
            <tr key={c.id}>
              <td>{c.cliente}</td>
              <td className="acoes">
                <button
                  type="button"
                  className="danger"
                  onClick={() => remover(c.id)}
                >
                  Remover
                </button>
              </td>
            </tr>
          ))}

          {vinculados.length === 0 && (
            <tr>
              <td colSpan={2}>Nenhum cliente vinculado a este usuário.</td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
}

export default UsuariosClientesTab;
