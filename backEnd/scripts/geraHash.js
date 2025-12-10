// // backEnd/geraHash.js
// import bcrypt from "bcrypt";

// async function gerarHashes() {
//   const senhaDaniel = "11225"; // ex.: C@f3#2025!Daniel
//   const senhaCarol = "12345";
//   const senhaBruna = "12345";

//   const hashDaniel = await bcrypt.hash(senhaDaniel, 10);
//   const hashCarol = await bcrypt.hash(senhaCarol, 10);
//   const hashBruna = await bcrypt.hash(senhaBruna, 10);

//   console.log("Hash Daniel:", hashDaniel);
//   console.log("Hash Carol :", hashCarol);
//   console.log("Hash Bruna :", hashCarol);
// }

// gerarHashes();

import bcrypt from "bcrypt";

const gerar = async () => {
  const senhaPura = "12345";
  const hash = await bcrypt.hash(senhaPura, 10);
  console.log("HASH NOVO:", hash);
};

gerar();
