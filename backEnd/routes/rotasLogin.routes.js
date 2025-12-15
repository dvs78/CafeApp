// backEnd/routes/rotasLogin.routes.js
import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "./connect.routes.js";
import "dotenv/config";

const router = Router();

const normalizeEmail = (s) =>
  String(s || "")
    .trim()
    .toLowerCase();

router.post("/", async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const senha = String(req.body.senha || "");

  if (!email || !senha) {
    return res.status(400).json({ erro: "Email e senha são obrigatórios" });
  }

  try {
    // 1) busca usuário (AGORA com role_global)
    const qUser = `
      SELECT id, usuario, email, senha, role_global
      FROM usuarios
      WHERE lower(email) = $1
      LIMIT 1
    `;
    const { rows: userRows } = await pool.query(qUser, [email]);

    if (userRows.length === 0) {
      return res.status(401).json({ erro: "Usuário ou senha inválidos" });
    }

    const u = userRows[0];

    const senhaConfere = await bcrypt.compare(senha, u.senha);
    if (!senhaConfere) {
      return res.status(401).json({ erro: "Usuário ou senha inválidos" });
    }

    // 2) busca clientes permitidos
    let clientes = [];

    if (u.role_global === "super_admin") {
      const qAll = `
        SELECT id, cliente, 'super_admin'::text AS role
        FROM clientes
        ORDER BY cliente
      `;
      const { rows } = await pool.query(qAll);
      clientes = rows;
    } else {
      const qAllowed = `
        SELECT c.id, c.cliente, uc.role
        FROM usuarios_clientes uc
        JOIN clientes c ON c.id = uc.cliente_id
        WHERE uc.usuario_id = $1
        ORDER BY c.cliente
      `;
      const { rows } = await pool.query(qAllowed, [u.id]);
      clientes = rows;
    }

    // 3) token: mantém pequeno (não colocar lista de clientes no token)
    const payload = {
      id: u.id,
      usuario: u.usuario,
      email: u.email,
      role_global: u.role_global,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || "segredo-dev", {
      expiresIn: "8h",
    });

    return res.json({
      token,
      usuario: payload,
      clientes, // <- novo
    });
  } catch (err) {
    console.error("Erro no login:", err);
    return res.status(500).json({ erro: "Erro interno no servidor" });
  }
});

export default router;
