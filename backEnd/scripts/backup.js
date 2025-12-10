/**
 * Script de Backup PostgreSQL via pg_dump
 * ---------------------------------------
 * Reutilizável em qualquer projeto.
 */

import { exec } from "child_process";
import path from "path";

/* ==========================================================
   CONFIGURAÇÕES — ALTERE SOMENTE OS VALORES ABAIXO
   ========================================================== */

// Versão instalada do PostgreSQL
const POSTGRES_VERSION = "18";

// URL completa do seu banco PostgreSQL (local ou Render)
// tROQUE O QUE ESTÁ ENTRE `` e cole External Database URL
const DATABASE_URL = `postgresql://cafeappdb_8cz2_user:OZUlAW7ag7mdgTwerY0N1UqbDGFyqkVL@dpg-d4njnpfpm1nc73e92tmg-a.oregon-postgres.render.com/cafeappdb_8cz2`;

// Pasta onde o backup será salvo
const OUTPUT_FOLDER = "C:\\Users\\Daniel\\Documents\\Projetos\\CafeApp";

// Nome do arquivo de saída (você pode automatizar depois com data)
const OUTPUT_FILENAME = "cafeappdb_8cz2_export.sql";

/* ==========================================================
   NÃO PRECISA ALTERAR DESTA PARTE EM DIANTE
   ========================================================== */

// Caminho do pg_dump, calculado automaticamente pela versão
const PG_DUMP_PATH = `"C:\\Program Files\\PostgreSQL\\${POSTGRES_VERSION}\\bin\\pg_dump.exe"`;

// Caminho final do arquivo gerado
const OUTPUT_FILE = path.join(OUTPUT_FOLDER, OUTPUT_FILENAME);

/* ==========================================================
   MONTA O COMANDO FINAL
   ========================================================== */

const comando = `${PG_DUMP_PATH} "${DATABASE_URL}" -F p -f "${OUTPUT_FILE}"`;

console.log("Executando backup...");
console.log("Comando utilizado:");
console.log(comando);
console.log("----------------------------------");

/* ==========================================================
   EXECUTA O BACKUP
   ========================================================== */

exec(comando, (erro, stdout, stderr) => {
  if (erro) {
    console.error("Erro ao executar backup:");
    console.error(erro.message);
    return;
  }

  console.log("Backup concluído com sucesso!");
  console.log("Arquivo gerado em:", OUTPUT_FILE);

  if (stdout) console.log("STDOUT:", stdout);
  if (stderr) console.log("STDERR:", stderr);
});
