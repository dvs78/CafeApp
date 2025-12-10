// import { exec } from "child_process";
// import path from "path";
// import fs from "fs";
// import "dotenv/config";

// /* ==========================================================
//    CONFIGURAÇÕES — ALTERE SOMENTE NO .env
//    ========================================================== */

// const POSTGRES_VERSION = process.env.POSTGRES_VERSION ?? "18";

// const REMOTE_DATABASE_URL = process.env.REMOTE_DATABASE_URL;

// const OUTPUT_FOLDER = process.env.BACKUP_OUTPUT_FOLDER;
// const OUTPUT_FILENAME = process.env.BACKUP_OUTPUT_FILENAME ?? "db_export.sql";

// const LOCAL_HOST = process.env.LOCAL_HOST ?? "localhost";
// const LOCAL_PORT = Number(process.env.LOCAL_PORT ?? 5432);
// const LOCAL_DB = process.env.LOCAL_DB ?? "CafeApp";
// const LOCAL_USER = process.env.LOCAL_USER ?? "postgres";
// const LOCAL_PASSWORD = process.env.LOCAL_PASSWORD;

// /* ==========================================================
//    NÃO PRECISA ALTERAR DAQUI PARA BAIXO
//    ========================================================== */

// const PG_BIN_BASE = `C:\\Program Files\\PostgreSQL\\${POSTGRES_VERSION}\\bin`;
// const PG_DUMP_PATH = `"${PG_BIN_BASE}\\pg_dump.exe"`;
// const PSQL_PATH = `"${PG_BIN_BASE}\\psql.exe"`;

// // garante pasta de saída
// if (!fs.existsSync(OUTPUT_FOLDER)) {
//   fs.mkdirSync(OUTPUT_FOLDER, { recursive: true });
// }

// const OUTPUT_FILE = path.join(OUTPUT_FOLDER, OUTPUT_FILENAME);

// function executarComando(comando, etapa, envExtra = {}) {
//   console.log(`\n===== ${etapa} =====`);
//   console.log("Comando:");
//   console.log(comando);
//   console.log("----------------------------------");

//   return new Promise((resolve, reject) => {
//     exec(
//       comando,
//       {
//         shell: "cmd.exe",
//         env: { ...process.env, ...envExtra },
//       },
//       (erro, stdout, stderr) => {
//         if (erro) {
//           console.error(`Erro na etapa "${etapa}":`);
//           console.error(erro.message);
//           return reject(erro);
//         }

//         console.log(`Etapa "${etapa}" concluída!`);
//         if (stdout) console.log("STDOUT:", stdout);
//         if (stderr) console.log("STDERR:", stderr);

//         resolve();
//       }
//     );
//   });
// }

// // backup remoto
// const comandoBackup =
//   `${PG_DUMP_PATH} "${REMOTE_DATABASE_URL}" ` +
//   `-F p --no-owner --no-privileges -f "${OUTPUT_FILE}"`;

// // restore local
// const comandoRestore =
//   `${PSQL_PATH} -h ${LOCAL_HOST} -p ${LOCAL_PORT} ` +
//   `-U ${LOCAL_USER} -d ${LOCAL_DB} -f "${OUTPUT_FILE}"`;

// async function main() {
//   try {
//     console.log("Iniciando sincronização REMOTO -> LOCAL...");

//     await executarComando(comandoBackup, "BACKUP REMOTO (pg_dump)");

//     console.log(
//       "\nBackup remoto concluído. Iniciando RESTORE no banco local..."
//     );

//     await executarComando(comandoRestore, "RESTORE LOCAL (psql)", {
//       PGPASSWORD: LOCAL_PASSWORD,
//     });

//     console.log("\n✅ Sincronização concluída com sucesso!");
//     console.log("Arquivo utilizado:", OUTPUT_FILE);
//   } catch (erro) {
//     console.error("\n❌ Falha na sincronização.");
//     console.error("Detalhes:", erro.message);
//   }
// }

// main();

/**
 * Script de Sincronização PostgreSQL
 * ----------------------------------
 * 1) Faz backup do banco REMOTO via pg_dump
 * 2) (Opcional) Reseta o schema public do banco local
 * 3) Restaura no banco LOCAL via psql
 *
 * Reutilizável em qualquer projeto: basta alterar o .env.
 *
 * Uso:
 *   node .\scripts\syncRemoteToLocal.js
 */

import { exec } from "child_process";
import path from "path";
import fs from "fs";
import "dotenv/config";

/* ==========================================================
   FUNÇÃO AUXILIAR: EXIGIR VARIÁVEIS OBRIGATÓRIAS
   ========================================================== */

function exigir(nome, valor) {
  if (!valor) {
    console.error(
      `\n[ERRO] Variável de ambiente obrigatória faltando: ${nome}`
    );
    console.error(`Defina ${nome} no arquivo .env e tente novamente.\n`);
    process.exit(1);
  }
  return valor;
}

/* ==========================================================
   CONFIGURAÇÕES — DEFINIDAS NO .env
   ========================================================== */

// Versão instalada do PostgreSQL no SEU COMPUTADOR
// (a mesma que você vê na pasta "C:\\Program Files\\PostgreSQL")
const POSTGRES_VERSION = process.env.POSTGRES_VERSION ?? "18";

// URL completa do banco REMOTO (Render, outro servidor, etc.)
const REMOTE_DATABASE_URL = exigir(
  "REMOTE_DATABASE_URL",
  process.env.REMOTE_DATABASE_URL
);

// Pasta onde o backup será salvo
const OUTPUT_FOLDER = exigir(
  "BACKUP_OUTPUT_FOLDER",
  process.env.BACKUP_OUTPUT_FOLDER
);

// Nome do arquivo de backup
const OUTPUT_FILENAME = process.env.BACKUP_OUTPUT_FILENAME ?? "db_export.sql";

// Config do banco LOCAL (onde o restore será aplicado)
const LOCAL_HOST = process.env.LOCAL_HOST ?? "localhost";
const LOCAL_PORT = Number(process.env.LOCAL_PORT ?? 5432);
const LOCAL_DB = exigir("LOCAL_DB", process.env.LOCAL_DB);
const LOCAL_USER = exigir("LOCAL_USER", process.env.LOCAL_USER);
const LOCAL_PASSWORD = exigir("LOCAL_PASSWORD", process.env.LOCAL_PASSWORD);

// Flag opcional: resetar completamente o schema public antes do restore
// RESET_LOCAL_SCHEMA=true  => DROP SCHEMA public CASCADE; CREATE SCHEMA public;
const RESET_LOCAL_SCHEMA =
  (process.env.RESET_LOCAL_SCHEMA ?? "false").toLowerCase() === "true";

/* ==========================================================
   CAMINHOS DOS EXECUTÁVEIS (pg_dump / psql)
   ========================================================== */

const PG_BIN_BASE = `C:\\Program Files\\PostgreSQL\\${POSTGRES_VERSION}\\bin`;
const PG_DUMP_PATH = `"${PG_BIN_BASE}\\pg_dump.exe"`;
const PSQL_PATH = `"${PG_BIN_BASE}\\psql.exe"`;

// Garante pasta de saída
if (!fs.existsSync(OUTPUT_FOLDER)) {
  fs.mkdirSync(OUTPUT_FOLDER, { recursive: true });
}

// Caminho completo do arquivo de backup
const OUTPUT_FILE = path.join(OUTPUT_FOLDER, OUTPUT_FILENAME);

/* ==========================================================
   FUNÇÕES AUXILIARES
   ========================================================== */

// Mascara senha na URL de log (para não vazar credenciais no console)
function mascararUrl(url) {
  if (!url) return "";
  // troca "user:senha@" por "user:*****@"
  return url.replace(/(postgresql:\/\/[^:]+:)([^@]+)(@)/, "$1*****$3");
}

// Executa um comando de shell com logging
function executarComando(comandoReal, comandoLog, etapa, envExtra = {}) {
  console.log(`\n===== ${etapa} =====`);
  console.log("Comando:");
  console.log(comandoLog ?? comandoReal);
  console.log("----------------------------------");

  return new Promise((resolve, reject) => {
    exec(
      comandoReal,
      {
        shell: "cmd.exe",
        env: { ...process.env, ...envExtra },
      },
      (erro, stdout, stderr) => {
        if (erro) {
          console.error(`Erro na etapa "${etapa}":`);
          console.error(erro.message);
          return reject(erro);
        }

        console.log(`Etapa "${etapa}" concluída!`);
        if (stdout) console.log("STDOUT:", stdout);
        if (stderr) console.log("STDERR:", stderr);

        resolve();
      }
    );
  });
}

/* ==========================================================
   MONTA OS COMANDOS
   ========================================================== */

// 1) BACKUP REMOTO -> arquivo .sql
const comandoBackupReal =
  `${PG_DUMP_PATH} "${REMOTE_DATABASE_URL}" ` +
  `-F p --no-owner --no-privileges -f "${OUTPUT_FILE}"`;

// Versão do comando só para log (URL mascarada)
const comandoBackupLog =
  `${PG_DUMP_PATH} "${mascararUrl(REMOTE_DATABASE_URL)}" ` +
  `-F p --no-owner --no-privileges -f "${OUTPUT_FILE}"`;

// 2) (Opcional) DROP SCHEMA public no banco local
const comandoDropSchema =
  `${PSQL_PATH} -h ${LOCAL_HOST} -p ${LOCAL_PORT} ` +
  `-U ${LOCAL_USER} -d ${LOCAL_DB} ` +
  `-v ON_ERROR_STOP=1 ` +
  `-c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"`;

// 3) RESTORE LOCAL a partir do arquivo .sql
// ON_ERROR_STOP=1 faz o psql parar no primeiro erro de SQL
const comandoRestore =
  `${PSQL_PATH} -h ${LOCAL_HOST} -p ${LOCAL_PORT} ` +
  `-U ${LOCAL_USER} -d ${LOCAL_DB} -v ON_ERROR_STOP=1 -f "${OUTPUT_FILE}"`;

/* ==========================================================
   FLUXO PRINCIPAL
   ========================================================== */

async function main() {
  try {
    console.log("Iniciando sincronização REMOTO -> LOCAL...");
    console.log(`Arquivo de backup: ${OUTPUT_FILE}`);
    console.log(
      `Resetar schema local antes do restore: ${
        RESET_LOCAL_SCHEMA ? "SIM" : "NÃO"
      }`
    );

    // 1) BACKUP REMOTO
    await executarComando(
      comandoBackupReal,
      comandoBackupLog,
      "BACKUP REMOTO (pg_dump)"
    );

    // 2) (Opcional) reset do schema public no banco local
    if (RESET_LOCAL_SCHEMA) {
      console.log("\nLimpando schema 'public' no banco local...");
      await executarComando(
        comandoDropSchema,
        comandoDropSchema,
        "RESET SCHEMA LOCAL (public)",
        { PGPASSWORD: LOCAL_PASSWORD }
      );
    } else {
      console.log(
        "\n[AVISO] RESET_LOCAL_SCHEMA=false — o schema local NÃO será limpo antes do restore."
      );
      console.log(
        "Isso pode gerar mensagens de 'tabela já existe' ou 'duplicar valor da chave' se você rodar várias vezes."
      );
    }

    // 3) RESTORE LOCAL
    console.log(
      "\nBackup remoto concluído. Iniciando RESTORE no banco local..."
    );

    await executarComando(
      comandoRestore,
      comandoRestore,
      "RESTORE LOCAL (psql)",
      { PGPASSWORD: LOCAL_PASSWORD }
    );

    console.log("\n✅ Sincronização concluída com sucesso!");
    console.log("Remote DB -> Arquivo .sql -> Banco local");
    console.log("Arquivo utilizado:", OUTPUT_FILE);
  } catch (erro) {
    console.error("\n❌ Falha na sincronização.");
    console.error("Detalhes:", erro.message);
    process.exit(1);
  }
}

main();
