import express from "express";
import pool from "./connect.routes.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM safras_lista ORDER BY nome ASC"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao carregar safras" });
  }
});

export default router;
