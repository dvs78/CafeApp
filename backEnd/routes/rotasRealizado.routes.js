// routes/realizado.routes.js
// GET /realizado?cliente_id=...&safra_id=...&fazenda_id=...
import { Router } from "express";
import { randomUUID } from "crypto";
import pool from "./connect.routes.js";

const router = Router();

// -----------------------------
// GET /realizado
// -----------------------------
router.get("/", async (req, res) => {
  const { cliente_id, safra_id, fazenda_id } = req.query;

  if (!cliente_id) {
    return res.status(400).json({ erro: "cliente_id é obrigatório" });
  }

  try {
    const where = [];
    const params = [];

    params.push(cliente_id);
    where.push(`r.cliente_id = $${params.length}`);

    if (safra_id) {
      params.push(safra_id);
      where.push(`r.safra_id = $${params.length}`);
    }

    if (fazenda_id) {
      params.push(fazenda_id);
      where.push(`r.fazenda_id = $${params.length}`);
    }

    const sql = `
      SELECT
        r.id,
        r.safra_id,
        r.lavoura,
        r.servico,
        r.data,
        r.status,
        r.produto,
        r.unidade,
        r.quantidade,
        r.cliente_id,
        r.usuario_id,
        r.fazenda_id,
        f.fazenda AS fazenda
      FROM realizado r
      LEFT JOIN fazendas f ON f.id = r.fazenda_id
      WHERE ${where.join(" AND ")}
      ORDER BY r.data DESC NULLS LAST, r.id DESC
    `;

    const { rows } = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar realizados:", err);
    res.status(500).json({
      erro: "Erro ao buscar realizados",
      detalhe: err?.message,
    });
  }
});

// -----------------------------
// GET /realizado/:id
// -----------------------------
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const { rows } = await pool.query(
      `
      SELECT
        r.id,
        r.safra_id,
        r.lavoura,
        r.servico,
        r.data,
        r.status,
        r.produto,
        r.unidade,
        r.quantidade,
        r.cliente_id,
        r.usuario_id,
        r.fazenda_id,
        f.fazenda AS fazenda
      FROM realizado r
      LEFT JOIN fazendas f ON f.id = r.fazenda_id
      WHERE r.id = $1
      `,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ erro: "Registro não encontrado" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Erro ao buscar realizado:", err);
    res.status(500).json({
      erro: "Erro ao buscar realizado",
      detalhe: err?.message,
    });
  }
});

// -----------------------------
// POST /realizado
// -----------------------------
router.post("/", async (req, res) => {
  const {
    safra_id,
    lavoura,
    servico,
    data,
    status,
    produto,
    unidade,
    quantidade,
    cliente_id,
    usuario_id,
    fazenda_id,
  } = req.body;

  if (
    !safra_id ||
    !lavoura?.trim() ||
    !servico?.trim() ||
    !data ||
    !status ||
    !cliente_id ||
    !usuario_id ||
    !fazenda_id
  ) {
    return res.status(400).json({
      erro: "safra_id, lavoura, servico, data, status, cliente_id, usuario_id e fazenda_id são obrigatórios",
    });
  }

  try {
    // valida se a fazenda pertence ao cliente
    const chk = await pool.query(
      `SELECT 1 FROM fazendas WHERE id = $1 AND cliente_id = $2`,
      [fazenda_id, cliente_id]
    );
    if (!chk.rows.length) {
      return res
        .status(400)
        .json({ erro: "Fazenda inválida para este cliente." });
    }

    // duplicado: inclui fazenda_id
    const dup = await pool.query(
      `
      SELECT 1
      FROM realizado
      WHERE cliente_id = $1
        AND fazenda_id = $2
        AND safra_id = $3
        AND lower(trim(lavoura)) = lower(trim($4))
        AND lower(trim(servico)) = lower(trim($5))
        AND coalesce(lower(trim(produto)), '') = coalesce(lower(trim($6)), '')
      LIMIT 1
      `,
      [cliente_id, fazenda_id, safra_id, lavoura, servico, produto || ""]
    );

    if (dup.rows.length) {
      return res.status(409).json({
        erro: "Já existe lançamento com a mesma safra_id, Lavoura, Serviço e Produto para este cliente e fazenda.",
      });
    }

    // ✅ gera UUID no Node (não depende do pgcrypto)
    const id = randomUUID();

    const { rows } = await pool.query(
      `
      INSERT INTO realizado (
        id, safra_id, lavoura, servico, data, status,
        produto, unidade, quantidade,
        cliente_id, usuario_id, fazenda_id
      )
      VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9,
        $10, $11, $12
      )
      RETURNING
        id, safra_id, lavoura, servico, data, status,
        produto, unidade, quantidade,
        cliente_id, usuario_id, fazenda_id
      `,
      [
        id,
        safra_id,
        lavoura.trim(),
        servico.trim(),
        data,
        status,
        produto?.trim() || null,
        unidade?.trim() || null,
        quantidade ?? null,
        cliente_id,
        usuario_id,
        fazenda_id,
      ]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Erro ao criar realizado:", err);
    res.status(500).json({
      erro: "Erro ao criar realizado",
      detalhe: err?.message,
    });
  }
});

// -----------------------------
// PUT /realizado/:id
// -----------------------------
router.put("/:id", async (req, res) => {
  const { id } = req.params;

  const {
    safra_id,
    lavoura,
    servico,
    data,
    status,
    produto,
    unidade,
    quantidade,
    cliente_id,
    usuario_id,
    fazenda_id,
  } = req.body;

  if (
    !safra_id ||
    !lavoura?.trim() ||
    !servico?.trim() ||
    !data ||
    !status ||
    !cliente_id ||
    !usuario_id ||
    !fazenda_id
  ) {
    return res.status(400).json({
      erro: "safra_id, lavoura, servico, data, status, cliente_id, usuario_id e fazenda_id são obrigatórios",
    });
  }

  try {
    // valida fazenda do cliente
    const chk = await pool.query(
      `SELECT 1 FROM fazendas WHERE id = $1 AND cliente_id = $2`,
      [fazenda_id, cliente_id]
    );
    if (!chk.rows.length) {
      return res
        .status(400)
        .json({ erro: "Fazenda inválida para este cliente." });
    }

    // duplicado (inclui fazenda_id)
    const dup = await pool.query(
      `
      SELECT 1
      FROM realizado
      WHERE id <> $1
        AND cliente_id = $2
        AND fazenda_id = $3
        AND safra_id = $4
        AND lower(trim(lavoura)) = lower(trim($5))
        AND lower(trim(servico)) = lower(trim($6))
        AND coalesce(lower(trim(produto)), '') = coalesce(lower(trim($7)), '')
      LIMIT 1
      `,
      [id, cliente_id, fazenda_id, safra_id, lavoura, servico, produto || ""]
    );

    if (dup.rows.length) {
      return res.status(409).json({
        erro: "Já existe outro lançamento com a mesma safra_id, Lavoura, Serviço e Produto para este cliente e fazenda.",
      });
    }

    const { rows } = await pool.query(
      `
      UPDATE realizado
      SET
        safra_id = $1,
        lavoura = $2,
        servico = $3,
        data = $4,
        status = $5,
        produto = $6,
        unidade = $7,
        quantidade = $8,
        cliente_id = $9,
        usuario_id = $10,
        fazenda_id = $11
      WHERE id = $12
      RETURNING
        id, safra_id, lavoura, servico, data, status,
        produto, unidade, quantidade,
        cliente_id, usuario_id, fazenda_id
      `,
      [
        safra_id,
        lavoura.trim(),
        servico.trim(),
        data,
        status,
        produto?.trim() || null,
        unidade?.trim() || null,
        quantidade ?? null,
        cliente_id,
        usuario_id,
        fazenda_id,
        id,
      ]
    );

    if (!rows.length) {
      return res.status(404).json({ erro: "Registro não encontrado" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Erro ao atualizar realizado:", err);
    res.status(500).json({
      erro: "Erro ao atualizar realizado",
      detalhe: err?.message,
    });
  }
});

// -----------------------------
// DELETE /realizado/:id
// -----------------------------
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const { rowCount } = await pool.query(
      `DELETE FROM realizado WHERE id = $1`,
      [id]
    );

    if (!rowCount) {
      return res.status(404).json({ erro: "Registro não encontrado" });
    }

    res.json({ ok: true, id });
  } catch (err) {
    console.error("Erro ao excluir realizado:", err);
    res.status(500).json({
      erro: "Erro ao excluir realizado",
      detalhe: err?.message,
    });
  }
});

export default router;
