// backEnd/routes/rotasLavouras.routes.js
import { Router } from "express";
import pool from "./connect.routes.js";

const router = Router();

// GET /lavouras/:clienteId
router.get("/:clienteId", async (req, res) => {
  const { clienteId } = req.params;

  try {
    const { rows } = await pool.query(
      "SELECT id, nome, cliente_id FROM lavouras WHERE cliente_id = $1 ORDER BY nome ASC",
      [clienteId]
    );
    res.json(rows);
  } catch (err) {
    console.error("Erro ao carregar lavouras:", err);
    res.status(500).json({ erro: "Erro ao carregar lavouras" });
  }
});

// POST /lavouras  { nome, cliente_id }
router.post("/", async (req, res) => {
  const { nome, cliente_id } = req.body;

  if (!nome?.trim() || !cliente_id) {
    return res.status(400).json({ erro: "nome e cliente_id são obrigatórios" });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO lavouras (id, nome, cliente_id)
       VALUES (gen_random_uuid(), $1, $2)
       RETURNING id, nome, cliente_id`,
      [nome.trim(), cliente_id]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Erro ao criar lavoura:", err);
    res.status(500).json({ erro: "Erro ao criar lavoura" });
  }
});

// PUT /lavouras/:id  { nome }
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { nome } = req.body;

  if (!nome?.trim()) {
    return res.status(400).json({ erro: "nome é obrigatório" });
  }

  try {
    const { rows } = await pool.query(
      `UPDATE lavouras
       SET nome = $1
       WHERE id = $2
       RETURNING id, nome, cliente_id`,
      [nome.trim(), id]
    );

    if (!rows.length)
      return res.status(404).json({ erro: "Lavoura não encontrada" });

    res.json(rows[0]);
  } catch (err) {
    console.error("Erro ao atualizar lavoura:", err);
    res.status(500).json({ erro: "Erro ao atualizar lavoura" });
  }
});

// DELETE /lavouras/:id
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const { rows } = await pool.query(
      "DELETE FROM lavouras WHERE id = $1 RETURNING id",
      [id]
    );
    if (!rows.length)
      return res.status(404).json({ erro: "Lavoura não encontrada" });

    res.json({ ok: true });
  } catch (err) {
    console.error("Erro ao excluir lavoura:", err);
    res.status(500).json({ erro: "Erro ao excluir lavoura" });
  }
});

export default router;
