// // backEnd/routes/rotasProdutos.routes.js
// import { Router } from "express";
// import pool from "./connect.routes.js";

// const router = Router();

// function normalizeStr(v) {
//   return typeof v === "string" ? v.trim() : "";
// }

// /* =====================================================
//    GET /produtos -> lista
//    (se quiser, pode filtrar ?ativo=true/false)
// ===================================================== */
// router.get("/", async (req, res) => {
//   try {
//     const { ativo } = req.query;

//     let sql = `SELECT id, nome, ativo FROM produtos`;
//     const params = [];

//     if (ativo === "true" || ativo === "false") {
//       params.push(ativo === "true");
//       sql += ` WHERE ativo = $1`;
//     }

//     sql += ` ORDER BY nome ASC`;

//     const { rows } = await pool.query(sql, params);
//     res.json(rows);
//   } catch (err) {
//     console.error("Erro ao carregar produtos:", err);
//     res.status(500).json({ erro: "Erro ao carregar produtos" });
//   }
// });

// /* =====================================================
//    POST /produtos -> cria
// ===================================================== */
// router.post("/", async (req, res) => {
//   try {
//     const nome = normalizeStr(req.body.nome);
//     const ativo = req.body.ativo !== undefined ? !!req.body.ativo : true;

//     if (!nome) {
//       return res.status(400).json({ erro: "nome é obrigatório" });
//     }

//     const { rows } = await pool.query(
//       `INSERT INTO produtos (id, nome, ativo)
//        VALUES (gen_random_uuid(), $1, $2)
//        RETURNING id, nome, ativo`,
//       [nome, ativo]
//     );

//     res.status(201).json(rows[0]);
//   } catch (err) {
//     // duplicidade (unique index)
//     if (err?.code === "23505") {
//       return res.status(409).json({ erro: "Produto já cadastrado" });
//     }
//     console.error("Erro ao criar produto:", err);
//     res.status(500).json({ erro: "Erro ao criar produto" });
//   }
// });

// /* =====================================================
//    PUT /produtos/:id -> edita (nome e/ou ativo)
// ===================================================== */
// router.put("/:id", async (req, res) => {
//   try {
//     const { id } = req.params;

//     const nome =
//       req.body.nome !== undefined ? normalizeStr(req.body.nome) : undefined;
//     const ativo = req.body.ativo !== undefined ? !!req.body.ativo : undefined;

//     if (nome !== undefined && !nome) {
//       return res.status(400).json({ erro: "nome não pode ser vazio" });
//     }

//     const sets = [];
//     const vals = [];
//     let i = 1;

//     if (nome !== undefined) {
//       sets.push(`nome = $${i++}`);
//       vals.push(nome);
//     }
//     if (ativo !== undefined) {
//       sets.push(`ativo = $${i++}`);
//       vals.push(ativo);
//     }

//     if (sets.length === 0) {
//       return res.status(400).json({ erro: "Nenhum campo para atualizar" });
//     }

//     vals.push(id);

//     const { rows } = await pool.query(
//       `UPDATE produtos
//        SET ${sets.join(", ")}
//        WHERE id = $${i}
//        RETURNING id, nome, ativo`,
//       vals
//     );

//     if (rows.length === 0) {
//       return res.status(404).json({ erro: "Produto não encontrado" });
//     }

//     res.json(rows[0]);
//   } catch (err) {
//     if (err?.code === "23505") {
//       return res.status(409).json({ erro: "Produto já cadastrado" });
//     }
//     console.error("Erro ao atualizar produto:", err);
//     res.status(500).json({ erro: "Erro ao atualizar produto" });
//   }
// });

// /* =====================================================
//    DELETE /produtos/:id -> exclui
// ===================================================== */
// router.delete("/:id", async (req, res) => {
//   try {
//     const { id } = req.params;

//     const { rows } = await pool.query(
//       "DELETE FROM produtos WHERE id = $1 RETURNING id",
//       [id]
//     );

//     if (rows.length === 0) {
//       return res.status(404).json({ erro: "Produto não encontrado" });
//     }

//     res.json({ ok: true });
//   } catch (err) {
//     console.error("Erro ao excluir produto:", err);
//     res.status(500).json({ erro: "Erro ao excluir produto" });
//   }
// });

// export default router;

// backEnd/routes/rotasProdutos.routes.js
import { Router } from "express";
import pool from "./connect.routes.js";

const router = Router();

function norm(v) {
  return typeof v === "string" ? v.trim() : "";
}

// GET /produtos?ativo=true|false&q=texto
router.get("/", async (req, res) => {
  try {
    const { ativo, q } = req.query;

    const filtros = [];
    const vals = [];
    let i = 1;

    if (ativo === "true" || ativo === "false") {
      filtros.push(`ativo = $${i++}`);
      vals.push(ativo === "true");
    }

    if (q && String(q).trim()) {
      filtros.push(`LOWER(nome) LIKE $${i++}`);
      vals.push(`%${String(q).trim().toLowerCase()}%`);
    }

    const where = filtros.length ? `WHERE ${filtros.join(" AND ")}` : "";

    const { rows } = await pool.query(
      `SELECT id, nome, ativo
       FROM produtos
       ${where}
       ORDER BY nome ASC`,
      vals
    );

    res.json(rows);
  } catch (err) {
    console.error("Erro ao carregar produtos:", err);
    res.status(500).json({ erro: "Erro ao carregar produtos" });
  }
});

// POST /produtos
router.post("/", async (req, res) => {
  try {
    const nome = norm(req.body.nome);
    const ativo = req.body.ativo ?? true;

    if (!nome) {
      return res.status(400).json({ erro: "nome é obrigatório" });
    }

    const { rows } = await pool.query(
      `INSERT INTO produtos (id, nome, ativo)
       VALUES (gen_random_uuid(), $1, $2)
       RETURNING id, nome, ativo`,
      [nome, !!ativo]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    // se você criar unique no futuro
    if (err?.code === "23505") {
      return res.status(409).json({ erro: "Produto já cadastrado" });
    }
    console.error("Erro ao criar produto:", err);
    res.status(500).json({ erro: "Erro ao criar produto" });
  }
});

// PUT /produtos/:id
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const nome = req.body.nome !== undefined ? norm(req.body.nome) : undefined;
    const ativo = req.body.ativo !== undefined ? !!req.body.ativo : undefined;

    const sets = [];
    const vals = [];
    let i = 1;

    if (nome !== undefined) {
      if (!nome) return res.status(400).json({ erro: "nome é obrigatório" });
      sets.push(`nome = $${i++}`);
      vals.push(nome);
    }

    if (ativo !== undefined) {
      sets.push(`ativo = $${i++}`);
      vals.push(ativo);
    }

    if (sets.length === 0) {
      return res.status(400).json({ erro: "Nenhum campo para atualizar" });
    }

    vals.push(id);

    const { rows } = await pool.query(
      `UPDATE produtos
       SET ${sets.join(", ")}
       WHERE id = $${i}
       RETURNING id, nome, ativo`,
      vals
    );

    if (!rows.length)
      return res.status(404).json({ erro: "Produto não encontrado" });

    res.json(rows[0]);
  } catch (err) {
    if (err?.code === "23505") {
      return res.status(409).json({ erro: "Produto já cadastrado" });
    }
    console.error("Erro ao atualizar produto:", err);
    res.status(500).json({ erro: "Erro ao atualizar produto" });
  }
});

// DELETE /produtos/:id
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { rows } = await pool.query(
      "DELETE FROM produtos WHERE id = $1 RETURNING id",
      [id]
    );

    if (!rows.length)
      return res.status(404).json({ erro: "Produto não encontrado" });

    res.json({ ok: true });
  } catch (err) {
    console.error("Erro ao excluir produto:", err);
    res.status(500).json({ erro: "Erro ao excluir produto" });
  }
});

export default router;
