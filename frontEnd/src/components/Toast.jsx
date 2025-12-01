// src/components/Toast.jsx
import React from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Função utilitária para exibir mensagens
export const notificar = (tipo, mensagem) => {
  const config = {
    className: `toast-${tipo}`, // toast-success, toast-error etc.
    bodyClassName: "toast-body",
    icon:
      {
        sucesso: "✅",
        erro: "❌",
        info: "ℹ️",
        alerta: "⚠️",
      }[tipo] || "🔔",
  };

  switch (tipo) {
    case "sucesso":
      toast.success(mensagem, config);
      break;
    case "erro":
      toast.error(mensagem, config);
      break;
    case "info":
      toast.info(mensagem, config);
      break;
    case "alerta":
      toast.warning(mensagem, config);
      break;
    default:
      toast(mensagem, config);
      break;
  }
};

// Componente com o container (deve ser adicionado no App)
const Toast = () => {
  return <ToastContainer position="top-center" autoClose={3000} />;
};

export default Toast;
