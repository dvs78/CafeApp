import express from "express";
import cors from "cors";
import "dotenv/config";

import rotaslogin from "./routes/rotasLogin.routes.js";
import rotasServicosLista from "./routes/rotasServicosLista.routes.js";
import rotasRealizado from "./routes/rotasRealizado.routes.js";
import rotasSafras from "./routes/rotasSafras.routes.js";
import rotasProdutos from "./routes/rotasProdutos.routes.js";
import rotasLavouras from "./routes/rotasLavouras.routes.js";
import rotasCliente from "./routes/rotasCliente.routes.js";

import { fileURLToPath } from "url";
import path, { dirname } from "path";

const app = express();
// app.use(cors());
app.use(
  cors({
    origin: ["http://localhost:3001", "https://cafeapp-ial5.onrender.com"],
    credentials: true,
  })
);
// app.use(cors({
//   origin: [ "http://localhost:5173", "https://tasklist-o2yv.onrender.com" ],
//   credentials: true
// }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/login", rotaslogin);
app.use("/clientes", rotasCliente);
app.use("/safras", rotasSafras);
app.use("/lavouras", rotasLavouras);
app.use("/servicos-lista", rotasServicosLista);
app.use("/produtos", rotasProdutos);
app.use("/realizado", rotasRealizado);

// 2) SÓ DEPOIS: estáticos do front
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, "../frontEnd/dist");

app.use(express.static(distPath));

// 3) catch-all para rotas do React, só entra se NÃO começar com /api
app.get(/^(?!\/).*/, (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});
