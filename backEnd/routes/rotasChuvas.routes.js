import { Router } from "express";
import pool from "./connect.routes.js";

const router = Router();

/**
 * GET /chuvas/:clienteId
 * Query params opcionais:
 *  - fazenda_id
 *  - safra_id
 *  - pluviometro_id
 *  - data_ini (YYYY-MM-DD)
 *  - data_fim (YYYY-MM-DD)
 */
// GET /chuvas/:clienteId
router.get("/:clienteId", async (req, res) => {
  const { clienteId } = req.params;
  const { safra_id, fazenda_id, pluviometro_id, data_ini, data_fim } =
    req.query;

  try {
    const filtros = [`c.cliente_id = $1`];
    const params = [clienteId];
    let i = 2;

    if (safra_id) {
      filtros.push(`c.safra_id = $${i++}`);
      params.push(safra_id);
    }

    if (fazenda_id) {
      filtros.push(`c.fazenda_id = $${i++}`);
      params.push(fazenda_id);
    }

    if (pluviometro_id) {
      filtros.push(`c.pluviometro_id = $${i++}`);
      params.push(pluviometro_id);
    }

    if (data_ini) {
      filtros.push(`c.data >= $${i++}`);
      params.push(data_ini);
    }

    if (data_fim) {
      filtros.push(`c.data <= $${i++}`);
      params.push(data_fim);
    }

    const where = `WHERE ${filtros.join(" AND ")}`;

    const { rows } = await pool.query(
      `
      SELECT
        c.id,
        c.data,
        c.chuva,
        c.safra_id,
        c.cliente_id,
        c.fazenda_id,
        f.fazenda AS fazenda,
        c.pluviometro_id,
        p.nome AS pluviometro
      FROM chuvas c
      LEFT JOIN fazendas f ON f.id = c.fazenda_id
      LEFT JOIN pluviometros p ON p.id = c.pluviometro_id
      ${where}
      ORDER BY c.data DESC
      `,
      params
    );

    res.json(rows);
  } catch (err) {
    console.error("Erro ao carregar chuvas:", err);
    res.status(500).json({ erro: "Erro ao carregar chuvas" });
  }
});

/**
 * POST /chuvas
 * Body: { data, chuva, cliente_id, fazenda_id, pluviometro_id }
 * Regra: 1 lançamento por dia por pluviômetro (uq pluviometro_id + data)
 */
router.post("/", async (req, res) => {
  const { data, chuva, cliente_id, fazenda_id, pluviometro_id, safra_id } =
    req.body;

  if (
    !data ||
    !chuva ||
    !cliente_id ||
    !fazenda_id ||
    !pluviometro_id ||
    !safra_id
  ) {
    return res.status(400).json({
      erro: "data, chuva, cliente_id, fazenda_id, pluviometro_id e safra_id são obrigatórios",
    });
  }

  const chuvaNum = Number(chuva);
  if (Number.isNaN(chuvaNum) || chuvaNum < 0) {
    return res.status(400).json({ erro: "chuva deve ser um número >= 0 (mm)" });
  }

  try {
    // 1) valida se fazenda pertence ao cliente
    const chkFaz = await pool.query(
      `SELECT 1 FROM fazendas WHERE id = $1 AND cliente_id = $2`,
      [fazenda_id, cliente_id]
    );
    if (!chkFaz.rows.length) {
      return res
        .status(400)
        .json({ erro: "Fazenda inválida para este cliente." });
    }

    // 2) valida se pluviômetro pertence à fazenda e ao cliente
    const chkPluv = await pool.query(
      `SELECT 1 FROM pluviometros WHERE id = $1 AND fazenda_id = $2 AND cliente_id = $3`,
      [pluviometro_id, fazenda_id, cliente_id]
    );
    if (!chkPluv.rows.length) {
      return res
        .status(400)
        .json({ erro: "Pluviômetro inválido para esta fazenda/cliente." });
    }

    // 3) insere (se violar UNIQUE (pluviometro_id, data) -> 409)
    const { rows } = await pool.query(
      `
  INSERT INTO chuvas (
    id, data, chuva,
    cliente_id, fazenda_id, pluviometro_id, safra_id
  )
  VALUES (
    gen_random_uuid(), $1, $2,
    $3, $4, $5, $6
  )
  RETURNING id
  `,
      [data, chuvaNum, cliente_id, fazenda_id, pluviometro_id, safra_id]
    );

    // 4) devolve já com nomes
    const { rows: saida } = await pool.query(
      `
      SELECT
        c.id,
        c.data,
        c.chuva,
        c.cliente_id,
        c.fazenda_id,
        f.fazenda AS fazenda,
        c.pluviometro_id,
        p.nome AS pluviometro
      FROM chuvas c
      LEFT JOIN fazendas f ON f.id = c.fazenda_id
      LEFT JOIN pluviometros p ON p.id = c.pluviometro_id
      WHERE c.id = $1
      `,
      [rows[0].id]
    );

    res.status(201).json(saida[0]);
  } catch (err) {
    // UNIQUE violation (Postgres) -> 23505
    if (err?.code === "23505") {
      return res.status(409).json({
        erro: "Já existe lançamento de chuva para este pluviômetro nesta data.",
      });
    }
    console.error("Erro ao criar chuva:", err);
    res.status(500).json({ erro: "Erro ao criar chuva" });
  }
});

/**
 * PUT /chuvas/:id
 * Body: { data, chuva, fazenda_id, pluviometro_id } (data e chuva obrigatórios)
 * Obs: se trocar data/pluviometro pode bater no UNIQUE.
 */
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { data, chuva, fazenda_id, pluviometro_id, safra_id } = req.body;

  if (!data || chuva === undefined || chuva === null) {
    return res.status(400).json({ erro: "data e chuva são obrigatórios" });
  }

  const chuvaNum = Number(chuva);
  if (Number.isNaN(chuvaNum) || chuvaNum < 0) {
    return res.status(400).json({ erro: "chuva deve ser um número >= 0 (mm)" });
  }

  try {
    // pega registro atual (para validar corretamente quando mudar vínculos)
    const atual = await pool.query(
      `SELECT cliente_id, fazenda_id, pluviometro_id, safra_id FROM chuvas WHERE id = $1`,
      [id]
    );
    const safraFinal = safra_id || atual.rows[0].safra_id;

    if (!atual.rows.length) {
      return res.status(404).json({ erro: "Registro de chuva não encontrado" });
    }

    const cliente_id = atual.rows[0].cliente_id;
    const fazendaFinal = fazenda_id || atual.rows[0].fazenda_id;
    const pluvFinal = pluviometro_id || atual.rows[0].pluviometro_id;

    // valida fazenda do cliente
    const chkFaz = await pool.query(
      `SELECT 1 FROM fazendas WHERE id = $1 AND cliente_id = $2`,
      [fazendaFinal, cliente_id]
    );
    if (!chkFaz.rows.length) {
      return res
        .status(400)
        .json({ erro: "Fazenda inválida para este cliente." });
    }

    // valida pluviômetro na fazenda e cliente
    const chkPluv = await pool.query(
      `SELECT 1 FROM pluviometros WHERE id = $1 AND fazenda_id = $2 AND cliente_id = $3`,
      [pluvFinal, fazendaFinal, cliente_id]
    );
    if (!chkPluv.rows.length) {
      return res
        .status(400)
        .json({ erro: "Pluviômetro inválido para esta fazenda/cliente." });
    }

    await pool.query(
      `
  UPDATE chuvas
  SET
    data = $1,
    chuva = $2,
    fazenda_id = $3,
    pluviometro_id = $4,
    safra_id = $5
  WHERE id = $6
  `,
      [data, chuvaNum, fazendaFinal, pluvFinal, safraFinal, id]
    );

    const { rows: saida } = await pool.query(
      `
      SELECT
        c.id,
        c.data,
        c.chuva,
        c.cliente_id,
        c.fazenda_id,
        f.fazenda AS fazenda,
        c.pluviometro_id,
        p.nome AS pluviometro
      FROM chuvas c
      LEFT JOIN fazendas f ON f.id = c.fazenda_id
      LEFT JOIN pluviometros p ON p.id = c.pluviometro_id
      WHERE c.id = $1
      `,
      [id]
    );

    res.json(saida[0]);
  } catch (err) {
    if (err?.code === "23505") {
      return res.status(409).json({
        erro: "Já existe lançamento de chuva para este pluviômetro nesta data.",
      });
    }
    console.error("Erro ao atualizar chuva:", err);
    res.status(500).json({ erro: "Erro ao atualizar chuva" });
  }
});

/**
 * DELETE /chuvas/:id
 */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const { rows } = await pool.query(
      "DELETE FROM chuvas WHERE id = $1 RETURNING id",
      [id]
    );
    if (!rows.length) {
      return res.status(404).json({ erro: "Registro de chuva não encontrado" });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error("Erro ao excluir chuva:", err);
    res.status(500).json({ erro: "Erro ao excluir chuva" });
  }
});

export default router;
