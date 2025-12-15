import { useEffect, useState } from "react";
import api from "../../../services/api";
import { notificar } from "../../../components/Toast";

function FormProduto({ produto, onClose, onSaved }) {
  const editando = !!produto?.id;

  const [nome, setNome] = useState("");
  const [ativo, setAtivo] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (editando) {
      setNome(produto.nome || "");
      setAtivo(produto.ativo !== false);
    } else {
      setNome("");
      setAtivo(true);
    }
  }, [editando, produto]);

  function validar() {
    if (!nome.trim()) return "Informe o nome do produto.";
    return null;
  }

  async function salvar() {
    const erro = validar();
    if (erro) return notificar("erro", erro);

    setSalvando(true);
    try {
      const payload = {
        nome: nome.trim(),
        ativo: !!ativo,
      };

      let resp;
      if (editando) {
        resp = await api.put(`/produtos/${produto.id}`, payload);
        notificar("sucesso", "Produto atualizado.");
      } else {
        resp = await api.post("/produtos", payload);
        notificar("sucesso", "Produto criado.");
      }

      onSaved?.(resp.data);
      onClose?.();
    } catch (err) {
      const status = err?.response?.status;
      const msgApi = err?.response?.data?.erro;

      if (status === 409) {
        return notificar("erro", msgApi || "Produto já cadastrado.");
      }

      notificar("erro", msgApi || "Erro ao salvar produto.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <h3>{editando ? "Editar Produto" : "Novo Produto"}</h3>
          <button type="button" className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <label>Nome</label>
          <input value={nome} onChange={(e) => setNome(e.target.value)} />

          <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={ativo}
              onChange={(e) => setAtivo(e.target.checked)}
            />
            Ativo
          </label>
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancelar
          </button>
          <button
            type="button"
            onClick={salvar}
            className="btn-primary"
            disabled={salvando}
          >
            {salvando ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default FormProduto;
