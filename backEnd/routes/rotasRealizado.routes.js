// backEnd/routes/rotasRealizado.routes.js
import { Router } from "express";
import DbClassRealizado from "./DbClassRealizado.routes.js";

const router = Router();
const db = new DbClassRealizado();

// GET /realizado
router.get("/", async (req, res) => {
  try {
    const lista = await db.getAll();
    res.json(lista);
  } catch (err) {
    console.error("Erro ao buscar realizados:", err);
    res.status(500).json({ erro: "Erro ao buscar realizados" });
  }
});

// GET /realizado/:id
router.get("/:id", async (req, res) => {
  try {
    const item = await db.getById(req.params.id);
    if (!item) return res.status(404).json({ erro: "Registro não encontrado" });
    res.json(item);
  } catch (err) {
    console.error("Erro ao buscar realizado:", err);
    res.status(500).json({ erro: "Erro ao buscar realizado" });
  }
});

// POST /realizado
router.post("/", async (req, res) => {
  try {
    const novo = await db.create(req.body);
    res.status(201).json(novo);
  } catch (err) {
    console.error("Erro ao criar realizado:", err);
    res.status(500).json({ erro: "Erro ao criar realizado" });
  }
});

// PUT /realizado/:id
router.put("/:id", async (req, res) => {
  try {
    console.log("PUT /realizado body:", req.body); // 👈 log 1
    const atualizado = await db.updateById(req.params.id, req.body);
    console.log("PUT /realizado atualizado:", atualizado); // 👈 log 2
    if (!atualizado)
      return res.status(404).json({ erro: "Registro não encontrado" });
    res.json(atualizado);
  } catch (err) {
    console.error("Erro ao atualizar realizado:", err);
    res.status(500).json({ erro: "Erro ao atualizar realizado" });
  }
});

// DELETE /realizado/:id
router.delete("/:id", async (req, res) => {
  try {
    const apagado = await db.deleteById(req.params.id);
    if (!apagado)
      return res.status(404).json({ erro: "Registro não encontrado" });
    res.json(apagado);
  } catch (err) {
    console.error("Erro ao excluir realizado:", err);
    res.status(500).json({ erro: "Erro ao excluir realizado" });
  }
});

export default router;
