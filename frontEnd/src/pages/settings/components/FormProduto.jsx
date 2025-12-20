import { useEffect, useState } from "react";
import api from "../../../services/api";
import { notificar } from "../../../components/Toast";

import FormModal from "./FormModal";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";

function FormProduto({ produto, onClose, onSaved }) {
  const editando = Boolean(produto?.id);

  const [nome, setNome] = useState("");
  const [ativo, setAtivo] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (editando) {
      setNome(produto?.nome || "");
      setAtivo(!!produto?.ativo);
    } else {
      setNome("");
      setAtivo(true);
    }
  }, [editando, produto]);

  function validar() {
    const n = (nome || "").trim();
    if (!n) return "Informe o nome do produto.";
    if (n.length < 2) return "Nome do produto muito curto.";
    return null;
  }

  async function salvar() {
    if (salvando) return;

    const erro = validar();
    if (erro) return notificar("erro", erro);

    const nomeLimpo = (nome || "").trim();

    setSalvando(true);
    try {
      const payload = { nome: nomeLimpo, ativo: !!ativo };

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
    <FormModal
      title={editando ? "Editar Produto" : "Novo Produto"}
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            className="btn-primary"
            onClick={salvar}
            disabled={salvando}
          >
            {salvando ? "Salvando..." : "Salvar"}
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            disabled={salvando}
          >
            Cancelar
          </button>
        </>
      }
    >
      <div className="form-grid">
        {/* STATUS — PRIMEIRO */}
        <div className="form-field">
          <label>Status</label>

          <div className="form-select-wrapper">
            <select
              className="form-control"
              value={String(ativo)}
              onChange={(e) => setAtivo(e.target.value === "true")}
              disabled={salvando}
            >
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </select>

            <FontAwesomeIcon icon={faChevronDown} className="select-icon" />
          </div>
        </div>

        {/* NOME DO PRODUTO — DEPOIS */}
        <div className="form-field">
          <label>Nome do produto</label>
          <input
            className="form-control"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex.: Ureia, MAP, Priori Xtra..."
            autoFocus
            disabled={salvando}
          />
        </div>
      </div>
    </FormModal>
  );
}

export default FormProduto;
