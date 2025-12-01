// backEnd/geraHash.js
import bcrypt from "bcrypt";

async function gerarHashes() {
  const senhaDaniel = "11225"; // ex.: C@f3#2025!Daniel
  const senhaCarol = "12345";

  const hashDaniel = await bcrypt.hash(senhaDaniel, 10);
  const hashCarol = await bcrypt.hash(senhaCarol, 10);

  console.log("Hash Daniel:", hashDaniel);
  console.log("Hash Carol :", hashCarol);
}

gerarHashes();
