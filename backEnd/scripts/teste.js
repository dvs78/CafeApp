import { fileURLToPath } from "url";
import { dirname } from "path";

// console.log(import.meta.url);
const __fileName = fileURLToPath(import.meta.url);
console.log(__fileName); // caminho do aqruivo
const __dirname = dirname(__fileName);
console.log(__dirname); // caminho da pasta
