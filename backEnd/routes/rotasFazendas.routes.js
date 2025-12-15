// // backEnd/routes/rotasFazendas.routes.js
// import { Router } from "express";
// import pool from "./connect.routes.js";

// const router = Router();

// // GET /fazendas?cliente_id=UUID
// router.get("/", async (req, res) => {
//   const { cliente_id } = req.query;

//   if (!cliente_id) {
//     return res.status(400).json({ erro: "cliente_id é obrigatório" });
//   }

//   try {
//     const sql = `
//       SELECT id, fazenda, cliente_id
//       FROM fazendas
//       WHERE cliente_id = $1
//       ORDER BY fazenda
//     `;
//     const { rows } = await pool.query(sql, [cliente_id]);
//     return res.json(rows);
//   } catch (err) {
//     console.error("Erro ao listar fazendas:", err);
//     return res.status(500).json({ erro: "Erro interno no servidor" });
//   }
// });

// // POST /fazendas  (criar fazenda)
// router.post("/", async (req, res) => {
//   const { fazenda, cliente_id } = req.body;

//   if (!fazenda || !cliente_id) {
//     return res
//       .status(400)
//       .json({ erro: "fazenda e cliente_id são obrigatórios" });
//   }

//   try {
//     const sql = `
//       INSERT INTO fazendas (id, fazenda, cliente_id)
//       VALUES (gen_random_uuid(), $1, $2)
//       RETURNING *
//     `;
//     const { rows } = await pool.query(sql, [fazenda, cliente_id]);
//     return res.status(201).json(rows[0]);
//   } catch (err) {
//     console.error("Erro ao criar fazenda:", err);
//     return res.status(500).json({ erro: "Erro interno no servidor" });
//   }
// });

// // PUT /fazendas/:id  (editar fazenda)
// router.put("/:id", async (req, res) => {
//   const { id } = req.params;
//   const { fazenda } = req.body;

//   if (!fazenda) {
//     return res.status(400).json({ erro: "fazenda é obrigatório" });
//   }

//   try {
//     const sql = `
//       UPDATE fazendas
//       SET fazenda = $1
//       WHERE id = $2
//       RETURNING *
//     `;
//     const { rows } = await pool.query(sql, [fazenda, id]);

//     if (rows.length === 0) {
//       return res.status(404).json({ erro: "Fazenda não encontrada" });
//     }

//     return res.json(rows[0]);
//   } catch (err) {
//     console.error("Erro ao atualizar fazenda:", err);
//     return res.status(500).json({ erro: "Erro interno no servidor" });
//   }
// });

// // DELETE /fazendas/:id
// router.delete("/:id", async (req, res) => {
//   const { id } = req.params;

//   try {
//     const sql = `DELETE FROM fazendas WHERE id = $1 RETURNING *`;
//     const { rows } = await pool.query(sql, [id]);

//     if (rows.length === 0) {
//       return res.status(404).json({ erro: "Fazenda não encontrada" });
//     }

//     return res.json({ ok: true });
//   } catch (err) {
//     console.error("Erro ao excluir fazenda:", err);
//     return res.status(500).json({ erro: "Erro interno no servidor" });
//   }
// });

// export default router;

// backEnd/routes/rotasFazendas.routes.js
import { Router } from "express";
import pool from "./connect.routes.js";

const router = Router();

// GET /fazendas?cliente_id=UUID  (opcional)
// - se vier cliente_id: filtra
// - se não vier: lista todas (admin/debug)
router.get("/", async (req, res) => {
  const { cliente_id } = req.query;

  try {
    if (cliente_id) {
      const sql = `
        SELECT id, fazenda, cliente_id
        FROM fazendas
        WHERE cliente_id = $1
        ORDER BY fazenda ASC
      `;
      const { rows } = await pool.query(sql, [cliente_id]);
      return res.json(rows);
    }

    // admin: lista geral com nome do cliente
    const sql = `
      SELECT f.id, f.fazenda, f.cliente_id, c.cliente
      FROM fazendas f
      JOIN clientes c ON c.id = f.cliente_id
      ORDER BY c.cliente ASC, f.fazenda ASC
    `;
    const { rows } = await pool.query(sql);
    return res.json(rows);
  } catch (err) {
    console.error("Erro ao listar fazendas:", err);
    return res.status(500).json({ erro: "Erro interno no servidor" });
  }
});

// GET /fazendas/:id
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const sql = `
      SELECT f.id, f.fazenda, f.cliente_id, c.cliente
      FROM fazendas f
      JOIN clientes c ON c.id = f.cliente_id
      WHERE f.id = $1
    `;
    const { rows } = await pool.query(sql, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ erro: "Fazenda não encontrada" });
    }

    return res.json(rows[0]);
  } catch (err) {
    console.error("Erro ao buscar fazenda:", err);
    return res.status(500).json({ erro: "Erro interno no servidor" });
  }
});

// POST /fazendas
router.post("/", async (req, res) => {
  const { fazenda, cliente_id } = req.body;

  if (!fazenda || !cliente_id) {
    return res
      .status(400)
      .json({ erro: "fazenda e cliente_id são obrigatórios" });
  }

  try {
    const sql = `
      INSERT INTO fazendas (id, fazenda, cliente_id)
      VALUES (gen_random_uuid(), $1, $2)
      RETURNING id, fazenda, cliente_id
    `;
    const { rows } = await pool.query(sql, [fazenda.trim(), cliente_id]);
    return res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Erro ao criar fazenda:", err);
    return res.status(500).json({ erro: "Erro interno no servidor" });
  }
});

// PUT /fazendas/:id
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { fazenda } = req.body;

  if (!fazenda) {
    return res.status(400).json({ erro: "fazenda é obrigatório" });
  }

  try {
    const sql = `
      UPDATE fazendas
      SET fazenda = $1
      WHERE id = $2
      RETURNING id, fazenda, cliente_id
    `;
    const { rows } = await pool.query(sql, [fazenda.trim(), id]);

    if (rows.length === 0) {
      return res.status(404).json({ erro: "Fazenda não encontrada" });
    }

    return res.json(rows[0]);
  } catch (err) {
    console.error("Erro ao atualizar fazenda:", err);
    return res.status(500).json({ erro: "Erro interno no servidor" });
  }
});

// DELETE /fazendas/:id
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const sql = `DELETE FROM fazendas WHERE id = $1 RETURNING id`;
    const { rows } = await pool.query(sql, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ erro: "Fazenda não encontrada" });
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error("Erro ao excluir fazenda:", err);
    return res.status(500).json({ erro: "Erro interno no servidor" });
  }
});

export default router;
