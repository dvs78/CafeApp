// // backEnd/routes/rotasRealizado.routes.js
// import { Router } from "express";
// import DbClassRealizado from "./DbClassRealizado.routes.js";

// const router = Router();
// const db = new DbClassRealizado();

// // GET /realizado
// router.get("/", async (req, res) => {
//   try {
//     const lista = await db.getAll();
//     res.json(lista);
//   } catch (err) {
//     console.error("Erro ao buscar realizados:", err);
//     res.status(500).json({ erro: "Erro ao buscar realizados" });
//   }
// });

// // GET /realizado/:id
// router.get("/:id", async (req, res) => {
//   try {
//     const item = await db.getById(req.params.id);
//     if (!item) return res.status(404).json({ erro: "Registro não encontrado" });
//     res.json(item);
//   } catch (err) {
//     console.error("Erro ao buscar realizado:", err);
//     res.status(500).json({ erro: "Erro ao buscar realizado" });
//   }
// });

// // POST /realizado
// router.post("/", async (req, res) => {
//   try {
//     const novo = await db.create(req.body);
//     res.status(201).json(novo);
//   } catch (err) {
//     console.error("Erro ao criar realizado:", err);
//     res.status(500).json({ erro: "Erro ao criar realizado" });
//   }
// });

// // PUT /realizado/:id
// router.put("/:id", async (req, res) => {
//   try {
//     console.log("PUT /realizado body:", req.body); // 👈 log 1
//     const atualizado = await db.updateById(req.params.id, req.body);
//     console.log("PUT /realizado atualizado:", atualizado); // 👈 log 2
//     if (!atualizado)
//       return res.status(404).json({ erro: "Registro não encontrado" });
//     res.json(atualizado);
//   } catch (err) {
//     console.error("Erro ao atualizar realizado:", err);
//     res.status(500).json({ erro: "Erro ao atualizar realizado" });
//   }
// });

// // DELETE /realizado/:id
// router.delete("/:id", async (req, res) => {
//   try {
//     const apagado = await db.deleteById(req.params.id);
//     if (!apagado)
//       return res.status(404).json({ erro: "Registro não encontrado" });
//     res.json(apagado);
//   } catch (err) {
//     console.error("Erro ao excluir realizado:", err);
//     res.status(500).json({ erro: "Erro ao excluir realizado" });
//   }
// });

// export default router;

// backEnd/routes/rotasRealizado.routes.js
import { Router } from "express";
import pool from "./connect.routes.js";

const router = Router();

/**
 * GET /realizado
 * Query: ?cliente_id=...&safra=...&fazenda=...
 * Retorna lançamentos do cliente (obrigatório) e opcionalmente filtra safra/fazenda.
 */
router.get("/", async (req, res) => {
  const { cliente_id, safra, fazenda } = req.query;

  if (!cliente_id) {
    return res.status(400).json({ erro: "cliente_id é obrigatório" });
  }

  try {
    const where = [];
    const params = [];

    params.push(cliente_id);
    where.push(`r.cliente_id = $${params.length}`);

    if (safra) {
      params.push(safra);
      where.push(`r.safra = $${params.length}`);
    }

    // Se você tiver coluna "fazenda" (texto) no realizado, habilite:
    // if (fazenda) {
    //   params.push(fazenda);
    //   where.push(`r.fazenda = $${params.length}`);
    // }

    // Se você tiver fazenda_id no realizado, e quer filtrar por nome vindo do ctx (ex: "Limeira"):
    // if (fazenda) {
    //   params.push(fazenda);
    //   where.push(`f.fazenda = $${params.length}`);
    // }

    const sql = `
      SELECT
        r.id,
        r.safra,
        r.lavoura,
        r.servico,
        r.data,
        r.status,
        r.produto,
        r.unidade,
        r.quantidade,
        r.cliente_id,
        r.usuario_id
        -- Se existir:
        -- r.fazenda_id,
        -- f.fazenda AS fazenda
      FROM realizado r
      -- Se existir fazenda_id em realizado:
      -- LEFT JOIN fazendas f ON f.id = r.fazenda_id
      WHERE ${where.join(" AND ")}
      ORDER BY r.data DESC NULLS LAST, r.id DESC
    `;

    const { rows } = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar realizados:", err);
    res.status(500).json({ erro: "Erro ao buscar realizados" });
  }
});

/**
 * GET /realizado/:id
 */
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const { rows } = await pool.query(
      `
      SELECT
        r.id,
        r.safra,
        r.lavoura,
        r.servico,
        r.data,
        r.status,
        r.produto,
        r.unidade,
        r.quantidade,
        r.cliente_id,
        r.usuario_id
      FROM realizado r
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
    res.status(500).json({ erro: "Erro ao buscar realizado" });
  }
});

/**
 * POST /realizado
 * Body: { safra, lavoura, servico, data, status, produto?, unidade?, quantidade?, cliente_id, usuario_id }
 */
router.post("/", async (req, res) => {
  const {
    safra,
    lavoura,
    servico,
    data,
    status,
    produto,
    unidade,
    quantidade,
    cliente_id,
    usuario_id,
    // se existir no seu schema:
    // fazenda_id,
    // fazenda,
  } = req.body;

  if (
    !safra ||
    !lavoura?.trim() ||
    !servico?.trim() ||
    !data ||
    !status ||
    !cliente_id ||
    !usuario_id
  ) {
    return res.status(400).json({
      erro: "safra, lavoura, servico, data, status, cliente_id e usuario_id são obrigatórios",
    });
  }

  try {
    // (opcional, mas recomendado) evitar duplicado por safra+lavoura+servico+produto+cliente
    // Ajuste a regra se quiser considerar data/status também.
    const dup = await pool.query(
      `
      SELECT 1
      FROM realizado
      WHERE cliente_id = $1
        AND safra = $2
        AND lower(trim(lavoura)) = lower(trim($3))
        AND lower(trim(servico)) = lower(trim($4))
        AND coalesce(lower(trim(produto)), '') = coalesce(lower(trim($5)), '')
      LIMIT 1
      `,
      [cliente_id, safra, lavoura, servico, produto || ""]
    );

    if (dup.rows.length) {
      return res.status(409).json({
        erro: "Já existe lançamento com a mesma Safra, Lavoura, Serviço e Produto para este cliente.",
      });
    }

    const { rows } = await pool.query(
      `
      INSERT INTO realizado (
        id, safra, lavoura, servico, data, status,
        produto, unidade, quantidade,
        cliente_id, usuario_id
        -- se existir:
        -- , fazenda_id
        -- , fazenda
      )
      VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5,
        $6, $7, $8,
        $9, $10
        -- se existir:
        -- , $11
        -- , $12
      )
      RETURNING
        id, safra, lavoura, servico, data, status,
        produto, unidade, quantidade,
        cliente_id, usuario_id
      `,
      [
        safra,
        lavoura.trim(),
        servico.trim(),
        data,
        status,
        produto?.trim() || null,
        unidade?.trim() || null,
        quantidade ?? null,
        cliente_id,
        usuario_id,
        // fazenda_id || null,
        // fazenda || null,
      ]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Erro ao criar realizado:", err);
    res.status(500).json({ erro: "Erro ao criar realizado" });
  }
});

/**
 * PUT /realizado/:id
 * Body: campos editáveis (ex.: lavoura, servico, data, status, produto, unidade, quantidade)
 */
router.put("/:id", async (req, res) => {
  const { id } = req.params;

  const {
    safra,
    lavoura,
    servico,
    data,
    status,
    produto,
    unidade,
    quantidade,
    cliente_id,
    usuario_id,
  } = req.body;

  // aqui você decide seu mínimo obrigatório
  if (
    !safra ||
    !lavoura?.trim() ||
    !servico?.trim() ||
    !data ||
    !status ||
    !cliente_id ||
    !usuario_id
  ) {
    return res.status(400).json({
      erro: "safra, lavoura, servico, data, status, cliente_id e usuario_id são obrigatórios",
    });
  }

  try {
    // (opcional) bloquear update se virar duplicado
    const dup = await pool.query(
      `
      SELECT 1
      FROM realizado
      WHERE id <> $1
        AND cliente_id = $2
        AND safra = $3
        AND lower(trim(lavoura)) = lower(trim($4))
        AND lower(trim(servico)) = lower(trim($5))
        AND coalesce(lower(trim(produto)), '') = coalesce(lower(trim($6)), '')
      LIMIT 1
      `,
      [id, cliente_id, safra, lavoura, servico, produto || ""]
    );

    if (dup.rows.length) {
      return res.status(409).json({
        erro: "Já existe outro lançamento com a mesma Safra, Lavoura, Serviço e Produto para este cliente.",
      });
    }

    const { rows } = await pool.query(
      `
      UPDATE realizado
      SET
        safra = $1,
        lavoura = $2,
        servico = $3,
        data = $4,
        status = $5,
        produto = $6,
        unidade = $7,
        quantidade = $8,
        cliente_id = $9,
        usuario_id = $10
      WHERE id = $11
      RETURNING
        id, safra, lavoura, servico, data, status,
        produto, unidade, quantidade,
        cliente_id, usuario_id
      `,
      [
        safra,
        lavoura.trim(),
        servico.trim(),
        data,
        status,
        produto?.trim() || null,
        unidade?.trim() || null,
        quantidade ?? null,
        cliente_id,
        usuario_id,
        id,
      ]
    );

    if (!rows.length) {
      return res.status(404).json({ erro: "Registro não encontrado" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Erro ao atualizar realizado:", err);
    res.status(500).json({ erro: "Erro ao atualizar realizado" });
  }
});

/**
 * DELETE /realizado/:id
 */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const { rows } = await pool.query(
      "DELETE FROM realizado WHERE id = $1 RETURNING id",
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ erro: "Registro não encontrado" });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error("Erro ao excluir realizado:", err);
    res.status(500).json({ erro: "Erro ao excluir realizado" });
  }
});

export default router;
