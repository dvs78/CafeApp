// backEnd/routes/rotasCliente.routes.js
import { Router } from "express";
import DbClassCliente from "./DbClassCliente.routes.js";
import pool from "./connect.routes.js";

const router = Router();
const clienteDB = new DbClassCliente();

/* =====================================================
   GET /clientes  -> lista todos
===================================================== */
router.get("/", async (req, res) => {
  try {
    const resultado = await clienteDB.getAll(
      clienteDB.tabela,
      clienteDB.cols,
      "cliente ASC"
    );

    res.json(resultado);
  } catch (err) {
    console.error("Erro ao buscar clientes:", err);
    res.status(500).json({ erro: "Erro ao buscar clientes" });
  }
});

/* =====================================================
   GET /clientes/:id  -> pega um cliente pelo ID
===================================================== */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const query = "SELECT id, cliente FROM clientes WHERE id = $1";
    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ erro: "Cliente não encontrado" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Erro ao buscar cliente por ID:", err);
    res.status(500).json({ erro: "Erro ao buscar cliente" });
  }
});

/* =====================================================
   (Opcional) POST /clientes  -> criar cliente
===================================================== */
router.post("/", async (req, res) => {
  try {
    const payload = clienteDB.sanitize(req.body);

    const query = `
      INSERT INTO clientes (cliente)
      VALUES ($1)
      RETURNING id, cliente
    `;

    const { rows } = await pool.query(query, [payload.cliente]);

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Erro ao criar cliente:", err);
    res.status(500).json({ erro: "Erro ao criar cliente" });
  }
});

/* =====================================================
   (Opcional) PUT /clientes/:id  -> editar cliente
===================================================== */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const payload = clienteDB.sanitize(req.body);

    const query = `
      UPDATE clientes
      SET cliente = $1
      WHERE id = $2
      RETURNING id, cliente
    `;

    const { rows } = await pool.query(query, [payload.cliente, id]);

    if (rows.length === 0) {
      return res.status(404).json({ erro: "Cliente não encontrado" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Erro ao atualizar cliente:", err);
    res.status(500).json({ erro: "Erro ao atualizar cliente" });
  }
});

/* =====================================================
   (Opcional) DELETE /clientes/:id
===================================================== */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const query = "DELETE FROM clientes WHERE id = $1 RETURNING *";
    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ erro: "Cliente não encontrado" });
    }

    res.json({ mensagem: "Cliente removido" });
  } catch (err) {
    console.error("Erro ao excluir cliente:", err);
    res.status(500).json({ erro: "Erro ao excluir cliente" });
  }
});

export default router;
