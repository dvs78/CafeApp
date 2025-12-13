// src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.DEV
    ? "http://localhost:3001"
    : "https://cafeapp-ial5.onrender.com",
});

// 1) REQUEST: anexa token automaticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2) RESPONSE: trata 401 globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      // sessão inválida/expirada → limpa tudo
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      localStorage.removeItem("ctx_fazenda");
      localStorage.removeItem("ctx_safra");

      // força voltar pro login
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
