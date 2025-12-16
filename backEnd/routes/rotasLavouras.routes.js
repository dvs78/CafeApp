// // backEnd/routes/rotasLavouras.routes.js
// import { Router } from "express";
// import pool from "./connect.routes.js";

// const router = Router();

// // GET /lavouras/:clienteId
// router.get("/:clienteId", async (req, res) => {
//   const { clienteId } = req.params;

//   try {
//     const { rows } = await pool.query(
//       "SELECT id, nome, cliente_id FROM lavouras WHERE cliente_id = $1 ORDER BY nome ASC",
//       [clienteId]
//     );
//     res.json(rows);
//   } catch (err) {
//     console.error("Erro ao carregar lavouras:", err);
//     res.status(500).json({ erro: "Erro ao carregar lavouras" });
//   }
// });

// // POST /lavouras  { nome, cliente_id }
// router.post("/", async (req, res) => {
//   const { nome, cliente_id } = req.body;

//   if (!nome?.trim() || !cliente_id) {
//     return res.status(400).json({ erro: "nome e cliente_id são obrigatórios" });
//   }

//   try {
//     const { rows } = await pool.query(
//       `INSERT INTO lavouras (id, nome, cliente_id)
//        VALUES (gen_random_uuid(), $1, $2)
//        RETURNING id, nome, cliente_id`,
//       [nome.trim(), cliente_id]
//     );
//     res.status(201).json(rows[0]);
//   } catch (err) {
//     console.error("Erro ao criar lavoura:", err);
//     res.status(500).json({ erro: "Erro ao criar lavoura" });
//   }
// });

// // PUT /lavouras/:id  { nome }
// router.put("/:id", async (req, res) => {
//   const { id } = req.params;
//   const { nome } = req.body;

//   if (!nome?.trim()) {
//     return res.status(400).json({ erro: "nome é obrigatório" });
//   }

//   try {
//     const { rows } = await pool.query(
//       `UPDATE lavouras
//        SET nome = $1
//        WHERE id = $2
//        RETURNING id, nome, cliente_id`,
//       [nome.trim(), id]
//     );

//     if (!rows.length)
//       return res.status(404).json({ erro: "Lavoura não encontrada" });

//     res.json(rows[0]);
//   } catch (err) {
//     console.error("Erro ao atualizar lavoura:", err);
//     res.status(500).json({ erro: "Erro ao atualizar lavoura" });
//   }
// });

// // DELETE /lavouras/:id
// router.delete("/:id", async (req, res) => {
//   const { id } = req.params;

//   try {
//     const { rows } = await pool.query(
//       "DELETE FROM lavouras WHERE id = $1 RETURNING id",
//       [id]
//     );
//     if (!rows.length)
//       return res.status(404).json({ erro: "Lavoura não encontrada" });

//     res.json({ ok: true });
//   } catch (err) {
//     console.error("Erro ao excluir lavoura:", err);
//     res.status(500).json({ erro: "Erro ao excluir lavoura" });
//   }
// });

// export default router;
// backEnd/routes/rotasLavouras.routes.js
import { Router } from "express";
import pool from "./connect.routes.js";

const router = Router();

/**
 * GET /lavouras/:clienteId
 * Retorna lavouras do cliente + vínculo com fazenda (nome)
 */
router.get("/:clienteId", async (req, res) => {
  const { clienteId } = req.params;

  try {
    const { rows } = await pool.query(
      `
      SELECT
        l.id,
        l.nome,
        l.cliente_id,
        l.fazenda_id,
        f.fazenda AS fazenda
      FROM lavouras l
      LEFT JOIN fazendas f
        ON f.id = l.fazenda_id
      WHERE l.cliente_id = $1
      ORDER BY l.nome ASC
      `,
      [clienteId]
    );

    res.json(rows);
  } catch (err) {
    console.error("Erro ao carregar lavouras:", err);
    res.status(500).json({ erro: "Erro ao carregar lavouras" });
  }
});

/**
 * POST /lavouras
 * Body: { nome, cliente_id, fazenda_id }
 */
router.post("/", async (req, res) => {
  const { nome, cliente_id, fazenda_id } = req.body;

  if (!nome?.trim() || !cliente_id || !fazenda_id) {
    return res
      .status(400)
      .json({ erro: "nome, cliente_id e fazenda_id são obrigatórios" });
  }

  try {
    // (opcional, mas recomendado) valida se a fazenda pertence ao cliente
    const chk = await pool.query(
      `SELECT 1 FROM fazendas WHERE id = $1 AND cliente_id = $2`,
      [fazenda_id, cliente_id]
    );
    if (!chk.rows.length) {
      return res
        .status(400)
        .json({ erro: "Fazenda inválida para este cliente." });
    }

    const { rows } = await pool.query(
      `
      INSERT INTO lavouras (id, nome, cliente_id, fazenda_id)
      VALUES (gen_random_uuid(), $1, $2, $3)
      RETURNING id, nome, cliente_id, fazenda_id
      `,
      [nome.trim(), cliente_id, fazenda_id]
    );

    // devolve já com o nome da fazenda
    const { rows: saida } = await pool.query(
      `
      SELECT
        l.id,
        l.nome,
        l.cliente_id,
        l.fazenda_id,
        f.fazenda AS fazenda
      FROM lavouras l
      LEFT JOIN fazendas f ON f.id = l.fazenda_id
      WHERE l.id = $1
      `,
      [rows[0].id]
    );

    res.status(201).json(saida[0]);
  } catch (err) {
    console.error("Erro ao criar lavoura:", err);
    res.status(500).json({ erro: "Erro ao criar lavoura" });
  }
});

/**
 * PUT /lavouras/:id
 * Body: { nome, fazenda_id } (nome obrigatório; fazenda_id opcional)
 */
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { nome, fazenda_id } = req.body;

  if (!nome?.trim()) {
    return res.status(400).json({ erro: "nome é obrigatório" });
  }

  try {
    // se vier fazenda_id, valida que existe (e opcionalmente que pertence ao mesmo cliente)
    if (fazenda_id) {
      const chk = await pool.query(`SELECT 1 FROM fazendas WHERE id = $1`, [
        fazenda_id,
      ]);
      if (!chk.rows.length) {
        return res.status(400).json({ erro: "Fazenda inválida." });
      }
    }

    const { rows } = await pool.query(
      `
      UPDATE lavouras
      SET
        nome = $1,
        fazenda_id = COALESCE($2, fazenda_id)
      WHERE id = $3
      RETURNING id, nome, cliente_id, fazenda_id
      `,
      [nome.trim(), fazenda_id || null, id]
    );

    if (!rows.length) {
      return res.status(404).json({ erro: "Lavoura não encontrada" });
    }

    // devolve já com o nome da fazenda
    const { rows: saida } = await pool.query(
      `
      SELECT
        l.id,
        l.nome,
        l.cliente_id,
        l.fazenda_id,
        f.fazenda AS fazenda
      FROM lavouras l
      LEFT JOIN fazendas f ON f.id = l.fazenda_id
      WHERE l.id = $1
      `,
      [id]
    );

    res.json(saida[0]);
  } catch (err) {
    console.error("Erro ao atualizar lavoura:", err);
    res.status(500).json({ erro: "Erro ao atualizar lavoura" });
  }
});

/**
 * DELETE /lavouras/:id
 */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const { rows } = await pool.query(
      "DELETE FROM lavouras WHERE id = $1 RETURNING id",
      [id]
    );
    if (!rows.length) {
      return res.status(404).json({ erro: "Lavoura não encontrada" });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error("Erro ao excluir lavoura:", err);
    res.status(500).json({ erro: "Erro ao excluir lavoura" });
  }
});

export default router;
