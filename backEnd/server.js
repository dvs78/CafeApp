import express from "express";
import cors from "cors";
import "dotenv/config";

import rotaslogin from "./routes/rotasLogin.routes.js";
import rotasServicosLista from "./routes/rotasServicosLista.routes.js";
import rotasRealizado from "./routes/rotasRealizado.routes.js";
import rotasSafras from "./routes/rotasSafras.routes.js";
import rotasProdutos from "./routes/rotasProdutos.routes.js";
import rotasLavouras from "./routes/rotasLavouras.routes.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/login", rotaslogin);
app.use("/safras", rotasSafras);
app.use("/lavouras", rotasLavouras);
app.use("/servicos-lista", rotasServicosLista);
app.use("/produtos", rotasProdutos);
app.use("/realizado", rotasRealizado);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});
