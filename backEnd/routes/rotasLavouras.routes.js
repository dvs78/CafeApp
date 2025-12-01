import express from "express";
import pool from "./connect.routes.js";

const router = express.Router();

router.get("/:clienteId", async (req, res) => {
  const { clienteId } = req.params;

  try {
    const { rows } = await pool.query(
      "SELECT * FROM lavouras WHERE cliente_id = $1 ORDER BY nome ASC",
      [clienteId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao carregar lavouras" });
  }
});

export default router;
