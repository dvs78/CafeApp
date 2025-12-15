import { Router } from "express";
import pool from "./connect.routes.js";
import bcrypt from "bcryptjs";

const router = Router();

function isEmail(val) {
  return (
    typeof val === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())
  );
}

function normalizeStr(v) {
  return typeof v === "string" ? v.trim() : "";
}

/* =====================================================
   GET /usuarios -> lista (sem senha)
===================================================== */
router.get("/", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, usuario, email, role_global
       FROM usuarios
       ORDER BY usuario ASC`
    );
    res.json(rows);
  } catch (err) {
    console.error("Erro ao listar usuários:", err);
    res.status(500).json({ erro: "Erro ao listar usuários" });
  }
});

/* =====================================================
   POST /usuarios -> cria usuário (admin define senha)
===================================================== */
router.post("/", async (req, res) => {
  try {
    const usuario = normalizeStr(req.body.usuario);
    const email = normalizeStr(req.body.email).toLowerCase();
    const senha = normalizeStr(req.body.senha);
    const role_global = normalizeStr(req.body.role_global) || "user";

    if (!usuario || !email || !senha) {
      return res
        .status(400)
        .json({ erro: "usuario, email e senha são obrigatórios" });
    }
    if (!isEmail(email)) {
      return res.status(400).json({ erro: "email inválido" });
    }
    if (senha.length < 6) {
      return res
        .status(400)
        .json({ erro: "senha deve ter no mínimo 6 caracteres" });
    }
    if (!["user", "super_admin"].includes(role_global)) {
      return res.status(400).json({ erro: "role_global inválido" });
    }

    const hash = await bcrypt.hash(senha, 10);

    const { rows } = await pool.query(
      `INSERT INTO usuarios (id, usuario, email, senha, role_global)
       VALUES (gen_random_uuid(), $1, $2, $3, $4)
       RETURNING id, usuario, email, role_global`,
      [usuario, email, hash, role_global]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    // viola unique do email
    if (err?.code === "23505") {
      return res.status(409).json({ erro: "E-mail já cadastrado" });
    }
    console.error("Erro ao criar usuário:", err);
    res.status(500).json({ erro: "Erro ao criar usuário" });
  }
});

/* =====================================================
   PUT /usuarios/:id -> edita (senha opcional = reset)
===================================================== */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const usuario =
      req.body.usuario !== undefined
        ? normalizeStr(req.body.usuario)
        : undefined;
    const email =
      req.body.email !== undefined
        ? normalizeStr(req.body.email).toLowerCase()
        : undefined;
    const role_global =
      req.body.role_global !== undefined
        ? normalizeStr(req.body.role_global)
        : undefined;
    const senha =
      req.body.senha !== undefined ? normalizeStr(req.body.senha) : undefined;

    if (email !== undefined && !isEmail(email)) {
      return res.status(400).json({ erro: "email inválido" });
    }
    if (
      role_global !== undefined &&
      !["user", "super_admin"].includes(role_global)
    ) {
      return res.status(400).json({ erro: "role_global inválido" });
    }
    if (senha !== undefined && senha.length > 0 && senha.length < 6) {
      return res
        .status(400)
        .json({ erro: "senha deve ter no mínimo 6 caracteres" });
    }

    // monta update dinâmico
    const sets = [];
    const vals = [];
    let i = 1;

    if (usuario !== undefined) {
      sets.push(`usuario = $${i++}`);
      vals.push(usuario);
    }
    if (email !== undefined) {
      sets.push(`email = $${i++}`);
      vals.push(email);
    }
    if (role_global !== undefined) {
      sets.push(`role_global = $${i++}`);
      vals.push(role_global);
    }

    if (senha !== undefined && senha.length > 0) {
      const hash = await bcrypt.hash(senha, 10);
      sets.push(`senha = $${i++}`);
      vals.push(hash);
    }

    if (sets.length === 0) {
      return res.status(400).json({ erro: "Nenhum campo para atualizar" });
    }

    vals.push(id);

    const { rows } = await pool.query(
      `UPDATE usuarios
       SET ${sets.join(", ")}
       WHERE id = $${i}
       RETURNING id, usuario, email, role_global`,
      vals
    );

    if (rows.length === 0) {
      return res.status(404).json({ erro: "Usuário não encontrado" });
    }

    res.json(rows[0]);
  } catch (err) {
    if (err?.code === "23505") {
      return res.status(409).json({ erro: "E-mail já cadastrado" });
    }
    console.error("Erro ao atualizar usuário:", err);
    res.status(500).json({ erro: "Erro ao atualizar usuário" });
  }
});

/* =====================================================
   DELETE /usuarios/:id -> exclui usuário
===================================================== */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // remove vínculos primeiro (caso não tenha cascade)
    await client.query("DELETE FROM usuarios_clientes WHERE usuario_id = $1", [
      id,
    ]);

    const { rows } = await client.query(
      "DELETE FROM usuarios WHERE id = $1 RETURNING id",
      [id]
    );

    if (rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ erro: "Usuário não encontrado" });
    }

    await client.query("COMMIT");
    res.json({ ok: true });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Erro ao excluir usuário:", err);
    res.status(500).json({ erro: "Erro ao excluir usuário" });
  } finally {
    client.release();
  }
});

export default router;
