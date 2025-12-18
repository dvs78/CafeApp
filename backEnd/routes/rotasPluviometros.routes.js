import { Router } from "express";
import pool from "./connect.routes.js";

const router = Router();

/**
 * GET /pluviometros/:clienteId
 */
router.get("/:clienteId", async (req, res) => {
  const { clienteId } = req.params;

  try {
    const { rows } = await pool.query(
      `
      SELECT
        p.id,
        p.nome,
        p.cliente_id,
        p.fazenda_id,
        f.fazenda AS fazenda
      FROM pluviometros p
      LEFT JOIN fazendas f ON f.id = p.fazenda_id
      WHERE p.cliente_id = $1
      ORDER BY p.nome ASC
      `,
      [clienteId]
    );

    res.json(rows);
  } catch (err) {
    console.error("Erro ao carregar pluviômetros:", err);
    res.status(500).json({ erro: "Erro ao carregar pluviômetros" });
  }
});

/**
 * POST /pluviometros
 */
router.post("/", async (req, res) => {
  const { nome, cliente_id, fazenda_id } = req.body;

  if (!nome?.trim() || !cliente_id || !fazenda_id) {
    return res
      .status(400)
      .json({ erro: "nome, cliente_id e fazenda_id são obrigatórios" });
  }

  try {
    const chk = await pool.query(
      `SELECT 1 FROM fazendas WHERE id = $1 AND cliente_id = $2`,
      [fazenda_id, cliente_id]
    );
    if (!chk.rows.length) {
      return res.status(400).json({ erro: "Fazenda inválida." });
    }

    const { rows } = await pool.query(
      `
      INSERT INTO pluviometros (id, nome, cliente_id, fazenda_id)
      VALUES (gen_random_uuid(), $1, $2, $3)
      RETURNING id
      `,
      [nome.trim(), cliente_id, fazenda_id]
    );

    const { rows: saida } = await pool.query(
      `
      SELECT
        p.id,
        p.nome,
        p.cliente_id,
        p.fazenda_id,
        f.fazenda AS fazenda
      FROM pluviometros p
      LEFT JOIN fazendas f ON f.id = p.fazenda_id
      WHERE p.id = $1
      `,
      [rows[0].id]
    );

    res.status(201).json(saida[0]);
  } catch (err) {
    console.error("Erro ao criar pluviômetro:", err);
    res.status(500).json({ erro: "Erro ao criar pluviômetro" });
  }
});

/**
 * PUT /pluviometros/:id
 */
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { nome, fazenda_id } = req.body;

  if (!nome?.trim()) {
    return res.status(400).json({ erro: "nome é obrigatório" });
  }

  try {
    const { rows } = await pool.query(
      `
      UPDATE pluviometros
      SET nome = $1,
          fazenda_id = COALESCE($2, fazenda_id)
      WHERE id = $3
      RETURNING id
      `,
      [nome.trim(), fazenda_id || null, id]
    );

    if (!rows.length) {
      return res.status(404).json({ erro: "Pluviômetro não encontrado" });
    }

    const { rows: saida } = await pool.query(
      `
      SELECT
        p.id,
        p.nome,
        p.cliente_id,
        p.fazenda_id,
        f.fazenda AS fazenda
      FROM pluviometros p
      LEFT JOIN fazendas f ON f.id = p.fazenda_id
      WHERE p.id = $1
      `,
      [id]
    );

    res.json(saida[0]);
  } catch (err) {
    console.error("Erro ao atualizar pluviômetro:", err);
    res.status(500).json({ erro: "Erro ao atualizar pluviômetro" });
  }
});

/**
 * DELETE /pluviometros/:id
 */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const { rows } = await pool.query(
      `DELETE FROM pluviometros WHERE id = $1 RETURNING id`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ erro: "Pluviômetro não encontrado" });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error("Erro ao excluir pluviômetro:", err);
    res.status(500).json({ erro: "Erro ao excluir pluviômetro" });
  }
});

export default router;
