import { Router } from "express";
import pool from "./connect.routes.js";

const router = Router();

/**
 * GET /clientes
 * Lista todos os clientes
 */
router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `
      SELECT id, cliente
      FROM clientes
      ORDER BY cliente ASC
      `
    );

    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar clientes:", err);
    res.status(500).json({ erro: "Erro ao buscar clientes" });
  }
});

/**
 * GET /clientes/:id
 * Busca cliente por ID
 */
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const { rows } = await pool.query(
      `
      SELECT id, cliente
      FROM clientes
      WHERE id = $1
      `,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ erro: "Cliente não encontrado" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Erro ao buscar cliente por ID:", err);
    res.status(500).json({ erro: "Erro ao buscar cliente" });
  }
});

/**
 * POST /clientes
 * Body: { cliente }
 */
router.post("/", async (req, res) => {
  const { cliente } = req.body;

  if (!cliente?.trim()) {
    return res.status(400).json({ erro: "cliente é obrigatório" });
  }

  try {
    // (opcional, recomendado) impedir duplicado por nome (case-insensitive)
    const dup = await pool.query(
      `
      SELECT 1
      FROM clientes
      WHERE lower(trim(cliente)) = lower(trim($1))
      LIMIT 1
      `,
      [cliente]
    );

    if (dup.rows.length) {
      return res.status(409).json({ erro: "Cliente já existe" });
    }

    const { rows } = await pool.query(
      `
      INSERT INTO clientes (id, cliente)
      VALUES (gen_random_uuid(), $1)
      RETURNING id, cliente
      `,
      [cliente.trim()]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Erro ao criar cliente:", err);
    res.status(500).json({ erro: "Erro ao criar cliente" });
  }
});

/**
 * PUT /clientes/:id
 * Body: { cliente }
 */
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { cliente } = req.body;

  if (!cliente?.trim()) {
    return res.status(400).json({ erro: "cliente é obrigatório" });
  }

  try {
    // (opcional) impedir renomear para um nome já existente em outro registro
    const dup = await pool.query(
      `
      SELECT 1
      FROM clientes
      WHERE id <> $1
        AND lower(trim(cliente)) = lower(trim($2))
      LIMIT 1
      `,
      [id, cliente]
    );

    if (dup.rows.length) {
      return res
        .status(409)
        .json({ erro: "Já existe outro cliente com este nome" });
    }

    const { rows } = await pool.query(
      `
      UPDATE clientes
      SET cliente = $1
      WHERE id = $2
      RETURNING id, cliente
      `,
      [cliente.trim(), id]
    );

    if (!rows.length) {
      return res.status(404).json({ erro: "Cliente não encontrado" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Erro ao atualizar cliente:", err);
    res.status(500).json({ erro: "Erro ao atualizar cliente" });
  }
});

/**
 * DELETE /clientes/:id
 */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Se você tem FK (fazendas, lavouras, etc.), talvez queira bloquear exclusão:
    // - Ou deletar em cascata no BD
    // - Ou validar antes e retornar 400
    const { rows } = await pool.query(
      `
      DELETE FROM clientes
      WHERE id = $1
      RETURNING id
      `,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ erro: "Cliente não encontrado" });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error("Erro ao excluir cliente:", err);
    res.status(500).json({ erro: "Erro ao excluir cliente" });
  }
});

export default router;
