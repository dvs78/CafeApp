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
      setAtivo(!!produto.ativo);
    } else {
      setNome("");
      setAtivo(true);
    }
  }, [editando, produto]);

  function validar() {
    if (!nome.trim()) return "Informe o nome do produto.";
    if (nome.trim().length < 2) return "Nome do produto muito curto.";
    return null;
  }

  async function salvar() {
    const erro = validar();
    if (erro) return notificar("erro", erro);

    setSalvando(true);
    try {
      const payload = { nome: nome.trim(), ativo: !!ativo };

      if (editando) {
        await api.put(`/produtos/${produto.id}`, payload);
        notificar("sucesso", "Produto atualizado.");
      } else {
        await api.post("/produtos", payload);
        notificar("sucesso", "Produto criado.");
      }

      onSaved?.();
      onClose?.();
    } catch (err) {
      const msg = err?.response?.data?.erro || "Erro ao salvar produto.";
      notificar("erro", msg);
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
          <label>Nome do produto</label>
          <input value={nome} onChange={(e) => setNome(e.target.value)} />

          <label>Status</label>
          <select
            value={String(ativo)}
            onChange={(e) => setAtivo(e.target.value === "true")}
          >
            <option value="true">Ativo</option>
            <option value="false">Inativo</option>
          </select>
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
