// import bcrypt from "bcrypt";

// const senha = process.argv[2];

// if (!senha) {
//   console.error("❌ Informe a senha:");
//   console.error("👉 node gerarHash.js MINHA_SENHA");
//   process.exit(1);
// }

// const saltRounds = 10;

// const hash = await bcrypt.hash(senha, saltRounds);

// console.log("✅ Senha:", senha);
// console.log("🔐 Hash bcrypt:");
// console.log(hash);

// Rode no terminal, coloque a senha no final
// ex senha 11111
// node .\scripts\geraHash.js 11111

// Script Sql
// UPDATE usuarios
// SET senha = '<HASH_GERADO>'
// WHERE email = 'dvs.veiga78@gmail.com';

import bcrypt from "bcrypt";
import pool from "../routes/connect.routes.js";

const email = process.argv[2];
const senha = process.argv[3];

if (!email || !senha) {
  console.error("❌ Uso:");
  console.error("👉 node resetSenhaDev.js email senha");
  process.exit(1);
}

const hash = await bcrypt.hash(senha, 10);

await pool.query("UPDATE usuarios SET senha = $1 WHERE email = $2", [
  hash,
  email,
]);

console.log("✅ Senha atualizada com sucesso");
console.log("📧 Email:", email);
console.log("🔑 Nova senha:", senha);

process.exit(0);

// Rode no terminal, coloque o email e senha no final
// Acho que atualiza no banco local
// node scripts/geraHash.js dvs.veiga78@gmail.com 00000
// node scripts/geraHash.js contato@agrocoffe.com.br 00000
