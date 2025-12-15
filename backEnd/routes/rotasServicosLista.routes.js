// backEnd/routes/rotasServicosLista.routes.js
import { Router } from "express";
import pool from "./connect.routes.js";

const router = Router();

// GET /servicos-lista
router.get("/", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, nome FROM servicos_lista ORDER BY nome ASC"
    );
    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar serviços:", err);
    res.status(500).json({ erro: "Erro ao carregar lista de serviços" });
  }
});

// POST /servicos-lista  { nome }
router.post("/", async (req, res) => {
  const nome = (req.body.nome || "").trim();
  if (!nome) return res.status(400).json({ erro: "nome é obrigatório" });

  try {
    const { rows } = await pool.query(
      `INSERT INTO servicos_lista (id, nome)
       VALUES (gen_random_uuid(), $1)
       RETURNING id, nome`,
      [nome]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Erro ao criar serviço:", err);
    res.status(500).json({ erro: "Erro ao criar serviço" });
  }
});

// PUT /servicos-lista/:id  { nome }
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const nome = (req.body.nome || "").trim();
  if (!nome) return res.status(400).json({ erro: "nome é obrigatório" });

  try {
    const { rows } = await pool.query(
      `UPDATE servicos_lista
       SET nome = $1
       WHERE id = $2
       RETURNING id, nome`,
      [nome, id]
    );

    if (!rows.length) {
      return res.status(404).json({ erro: "Serviço não encontrado" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Erro ao atualizar serviço:", err);
    res.status(500).json({ erro: "Erro ao atualizar serviço" });
  }
});

// DELETE /servicos-lista/:id
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const { rows } = await pool.query(
      "DELETE FROM servicos_lista WHERE id = $1 RETURNING id",
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ erro: "Serviço não encontrado" });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error("Erro ao excluir serviço:", err);
    res.status(500).json({ erro: "Erro ao excluir serviço" });
  }
});

export default router;
