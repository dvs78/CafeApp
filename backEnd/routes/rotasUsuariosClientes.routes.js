import { Router } from "express";
import pool from "./connect.routes.js";

const router = Router();

/* =====================================================
   GET /usuarios-clientes/:usuarioId -> clientes vinculados
===================================================== */
router.get("/:usuarioId", async (req, res) => {
  const { usuarioId } = req.params;

  try {
    const { rows } = await pool.query(
      `SELECT c.id, c.cliente
       FROM usuarios_clientes uc
       JOIN clientes c ON c.id = uc.cliente_id
       WHERE uc.usuario_id = $1
       ORDER BY c.cliente ASC`,
      [usuarioId]
    );

    res.json(rows);
  } catch (err) {
    console.error("Erro ao listar vínculos usuario-clientes:", err);
    res.status(500).json({ erro: "Erro ao listar vínculos" });
  }
});

/* =====================================================
   POST /usuarios-clientes -> vincula
   body: { usuario_id, cliente_id }
===================================================== */
router.post("/", async (req, res) => {
  const { usuario_id, cliente_id } = req.body;

  if (!usuario_id || !cliente_id) {
    return res
      .status(400)
      .json({ erro: "usuario_id e cliente_id são obrigatórios" });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO usuarios_clientes (usuario_id, cliente_id)
       VALUES ($1, $2)
       ON CONFLICT (usuario_id, cliente_id) DO NOTHING
       RETURNING usuario_id, cliente_id`,
      [usuario_id, cliente_id]
    );

    // se já existia, rows vem vazio — ainda assim ok
    res.status(201).json(rows[0] || { usuario_id, cliente_id });
  } catch (err) {
    console.error("Erro ao vincular usuário ao cliente:", err);
    res.status(500).json({ erro: "Erro ao vincular usuário ao cliente" });
  }
});

/* =====================================================
   DELETE /usuarios-clientes -> desvincula
   body: { usuario_id, cliente_id }
===================================================== */
router.delete("/", async (req, res) => {
  const { usuario_id, cliente_id } = req.body;

  if (!usuario_id || !cliente_id) {
    return res
      .status(400)
      .json({ erro: "usuario_id e cliente_id são obrigatórios" });
  }

  try {
    await pool.query(
      `DELETE FROM usuarios_clientes
       WHERE usuario_id = $1 AND cliente_id = $2`,
      [usuario_id, cliente_id]
    );

    res.json({ ok: true });
  } catch (err) {
    console.error("Erro ao desvincular usuário do cliente:", err);
    res.status(500).json({ erro: "Erro ao desvincular usuário do cliente" });
  }
});

export default router;
