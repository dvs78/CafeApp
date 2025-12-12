// // backEnd/routes/rotasLogin.routes.js
// import { Router } from "express";
// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
// import pool from "./connect.routes.js";
// import "dotenv/config";

// const router = Router();

// // POST /login  (será montado em app.use("/login", router))
// router.post("/", async (req, res) => {
//   const { email, senha } = req.body;

//   if (!email || !senha) {
//     return res.status(400).json({ erro: "Email e senha são obrigatórios" });
//   }

//   try {
//     // busca usuário pelo email
//     const query =
//       "SELECT id, usuario, email, senha, cliente_id FROM usuarios WHERE email = $1";
//     const { rows } = await pool.query(query, [email]);

//     if (rows.length === 0) {
//       return res.status(401).json({ erro: "Usuário ou senha inválidos" });
//     }

//     const usuario = rows[0];

//     // compara senha digitada com hash do banco
//     const senhaConfere = await bcrypt.compare(senha, usuario.senha);
//     if (!senhaConfere) {
//       return res.status(401).json({ erro: "Usuário ou senha inválidos" });
//     }

//     // monta payload do token
//     const payload = {
//       id: usuario.id,
//       usuario: usuario.usuario,
//       email: usuario.email,
//       clienteId: usuario.cliente_id,
//     };

//     const token = jwt.sign(payload, process.env.JWT_SECRET || "segredo-dev", {
//       expiresIn: "8h",
//     });

//     // devolve pro front
//     res.json({
//       token,
//       usuario: payload,
//     });
//   } catch (err) {
//     console.error("Erro no login:", err);
//     res.status(500).json({ erro: "Erro interno no servidor" });
//   }
// });

// export default router;

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
    const query =
      "SELECT id, usuario, email, senha, cliente_id FROM usuarios WHERE lower(email) = $1";
    const { rows } = await pool.query(query, [email]);

    if (rows.length === 0) {
      return res.status(401).json({ erro: "Usuário ou senha inválidos" });
    }

    const usuario = rows[0];

    const senhaConfere = await bcrypt.compare(senha, usuario.senha);
    if (!senhaConfere) {
      return res.status(401).json({ erro: "Usuário ou senha inválidos" });
    }

    const payload = {
      id: usuario.id,
      usuario: usuario.usuario,
      email: usuario.email,
      clienteId: usuario.cliente_id,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || "segredo-dev", {
      expiresIn: "8h",
    });

    res.json({ token, usuario: payload });
  } catch (err) {
    console.error("Erro no login:", err);
    res.status(500).json({ erro: "Erro interno no servidor" });
  }
});

export default router;
