import express from "express";
import cors from "cors";
import "dotenv/config";

import rotaslogin from "./routes/rotasLogin.routes.js";
import rotasCliente from "./routes/rotasCliente.routes.js";
import rotasFazendas from "./routes/rotasFazendas.routes.js";
import rotasUsuarios from "./routes/rotasUsuarios.routes.js";
import rotasUsuariosClientes from "./routes/rotasUsuariosClientes.routes.js";

import rotasServicosLista from "./routes/rotasServicosLista.routes.js";
import rotasRealizado from "./routes/rotasRealizado.routes.js";
import rotasSafras from "./routes/rotasSafrasLista.routes.js";
import rotasProdutos from "./routes/rotasProdutos.routes.js";
import rotasLavouras from "./routes/rotasLavouras.routes.js";

import rotasFazendasUsuario from "./routes/rotasFazendasUsuario.routes.js";

import { fileURLToPath } from "url";
import path, { dirname } from "path";

const app = express();
app.use(cors());

app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/login", rotaslogin);
app.use("/clientes", rotasCliente);
app.use("/fazendas", rotasFazendas);
app.use("/usuarios", rotasUsuarios);
app.use("/usuarios-clientes", rotasUsuariosClientes);

app.use("/fazendas-usuario", rotasFazendasUsuario);
app.use("/safras-lista", rotasSafras);
app.use("/lavouras", rotasLavouras);
app.use("/servicos-lista", rotasServicosLista);
app.use("/produtos", rotasProdutos);
app.use("/realizado", rotasRealizado);

// 2) SÓ DEPOIS: estáticos do front
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, "../frontEnd/dist");

app.use(express.static(distPath));

// Essa rota sempre no final
// app.get(/.*/, (_req, res) => {
//   res.sendFile(path.join(distPath, "index.html"));
// });

app.get(/.*/, (req, res, next) => {
  const aceitaHtml = req.headers.accept?.includes("text/html");
  if (!aceitaHtml) return next();
  res.sendFile(path.join(distPath, "index.html"));
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});
