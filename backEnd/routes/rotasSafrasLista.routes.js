// backEnd/routes/rotasSafrasLista.routes.js
import { Router } from "express";
import pool from "./connect.routes.js";

const router = Router();

// GET /safras-lista
router.get("/", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, nome FROM safras_lista ORDER BY nome ASC"
    );
    res.json(rows);
  } catch (err) {
    console.error("Erro ao carregar safras:", err);
    res.status(500).json({ erro: "Erro ao carregar safras" });
  }
});

// POST /safras-lista  { nome }
router.post("/", async (req, res) => {
  const nome = (req.body.nome || "").trim();
  if (!nome) return res.status(400).json({ erro: "nome é obrigatório" });

  try {
    const { rows } = await pool.query(
      `INSERT INTO safras_lista (id, nome)
       VALUES (gen_random_uuid(), $1)
       RETURNING id, nome`,
      [nome]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Erro ao criar safra:", err);
    res.status(500).json({ erro: "Erro ao criar safra" });
  }
});

// PUT /safras-lista/:id  { nome }
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const nome = (req.body.nome || "").trim();
  if (!nome) return res.status(400).json({ erro: "nome é obrigatório" });

  try {
    const { rows } = await pool.query(
      `UPDATE safras_lista
       SET nome = $1
       WHERE id = $2
       RETURNING id, nome`,
      [nome, id]
    );

    if (!rows.length)
      return res.status(404).json({ erro: "Safra não encontrada" });

    res.json(rows[0]);
  } catch (err) {
    console.error("Erro ao atualizar safra:", err);
    res.status(500).json({ erro: "Erro ao atualizar safra" });
  }
});

// DELETE /safras-lista/:id
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const { rows } = await pool.query(
      "DELETE FROM safras_lista WHERE id = $1 RETURNING id",
      [id]
    );

    if (!rows.length)
      return res.status(404).json({ erro: "Safra não encontrada" });

    res.json({ ok: true });
  } catch (err) {
    console.error("Erro ao excluir safra:", err);
    res.status(500).json({ erro: "Erro ao excluir safra" });
  }
});

export default router;
