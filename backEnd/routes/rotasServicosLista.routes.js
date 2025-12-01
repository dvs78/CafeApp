import { Router } from "express";
import pool from "./connect.routes.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, nome FROM servicos_lista ORDER BY nome ASC"
    );
    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar serviços:", err);
    res.status(500).json({ erro: "Erro ao carregar lista de serviços" });
  }
});

export default router;
