import { Router } from "express";
import pool from "./connect.routes.js";

const router = Router();

// GET /fazendas-usuario/:usuarioId
router.get("/:usuarioId", async (req, res) => {
  const { usuarioId } = req.params;

  try {
    const sql = `
      SELECT
        f.id,
        f.fazenda,
        f.cliente_id,
        c.cliente AS cliente
      FROM fazendas f
      JOIN usuarios u ON u.cliente_id = f.cliente_id
      JOIN clientes c ON c.id = f.cliente_id
      WHERE u.id = $1
      ORDER BY f.fazenda ASC
    `;

    const { rows } = await pool.query(sql, [usuarioId]);
    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar fazendas do usuário:", err);
    res.status(500).json({ erro: "Erro ao buscar fazendas" });
  }
});

export default router;
