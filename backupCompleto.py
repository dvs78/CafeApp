# # # backup_agrocoffee_full.py
# # import os
# # import shutil
# # import subprocess
# # import datetime as dt
# # from pathlib import Path
# # from urllib.parse import quote_plus
# # import argparse
# # import time

# # import pandas as pd
# # from sqlalchemy import create_engine, text
# # import schedule

# # # ==== CONFIGURAÇÕES ==========================================================
# # USER = os.getenv("DB_USER", "cafeappdb_8cz2_user")
# # PASSWORD = os.getenv("DB_PASSWORD", "OZUlAW7ag7mdgTwerY0N1UqbDGFyqkVL")
# # HOST = os.getenv(
# #     "DB_HOST",
# #     "dpg-d4njnpfpm1nc73e92tmg-a.oregon-postgres.render.com"
# # )
# # PORT = int(os.getenv("DB_PORT", "5432"))
# # DBNAME = os.getenv("DB_NAME", "cafeappdb_8cz2")

# # # Pasta de backup (histórico .sql e .xlsx)
# # BACKUP_DIR = Path(
# #     os.getenv(
# #         "BACKUP_DIR",
# #         r"G:\Meu Drive\Python\Fazendas\Backup\Agrocoffee"
# #     )
# # )
# # BACKUP_DIR.mkdir(parents=True, exist_ok=True)

# # # Caminho do pg_dump (PostgreSQL 18)
# # PG_DUMP = os.getenv(
# #     "PG_DUMP",
# #     r"C:\Program Files\PostgreSQL\18\bin\pg_dump.exe"
# # )

# # PSQL_URL = (
# #     f"postgresql://{USER}:{quote_plus(PASSWORD)}"
# #     f"@{HOST}:{PORT}/{DBNAME}?sslmode=require"
# # )

# # SQLA_URL = (
# #     f"postgresql+psycopg2://{USER}:{quote_plus(PASSWORD)}"
# #     f"@{HOST}:{PORT}/{DBNAME}"
# # )

# # # ============================================================================


# # def _garante_pg_dump():
# #     """Verifica se o pg_dump existe ou tenta localizar no PATH."""
# #     if Path(PG_DUMP).exists():
# #         return PG_DUMP
# #     found = shutil.which("pg_dump")
# #     if found:
# #         return found
# #     raise FileNotFoundError(
# #         "pg_dump não encontrado. Ajuste a variável PG_DUMP ou adicione ao PATH."
# #     )


# # def backup_sql_via_pg_dump():
# #     """Gera um dump .sql completo do banco (em BACKUP_DIR)."""
# #     ts = dt.datetime.now().strftime("%Y-%m-%d_%H%M%S")
# #     sql_file = BACKUP_DIR / f"backup_{ts}.sql"

# #     print(f"[1/2] Gerando dump .sql em: {sql_file}")
# #     env = os.environ.copy()
# #     env["PGPASSWORD"] = PASSWORD

# #     cmd = [
# #         _garante_pg_dump(),
# #         "--no-owner",
# #         "--no-privileges",
# #         "--format=plain",
# #         "--dbname",
# #         PSQL_URL,
# #         "--file",
# #         str(sql_file),
# #     ]

# #     try:
# #         subprocess.run(cmd, check=True, env=env)
# #     finally:
# #         env.pop("PGPASSWORD", None)

# #     print("   ✔ Dump .sql criado com sucesso.")
# #     return sql_file


# # def export_to_excel():
# #     """Exporta TODAS as tabelas do schema public para um Excel em BACKUP_DIR, com Tabela do Excel em cada aba."""
# #     ts = dt.datetime.now().strftime("%Y-%m-%d_%H%M%S")
# #     xlsx_file = BACKUP_DIR / f"backup_realizado_{ts}.xlsx"

# #     print(f"[2/2] Exportando dados para Excel: {xlsx_file}")
# #     engine = create_engine(
# #         SQLA_URL,
# #         connect_args={"sslmode": "require"},
# #         pool_pre_ping=True,
# #     )

# #     with engine.connect() as conn:
# #         tables = (
# #             conn.execute(
# #                 text(
# #                     """
# #                     SELECT table_name
# #                     FROM information_schema.tables
# #                     WHERE table_schema='public' AND table_type='BASE TABLE'
# #                     ORDER BY table_name
# #                     """
# #                 )
# #             )
# #             .scalars()
# #             .all()
# #         )

# #         if not tables:
# #             print("   ⚠ Nenhuma tabela encontrada no schema 'public'.")
# #             # cria arquivo vazio mesmo assim
# #             with pd.ExcelWriter(xlsx_file, engine="xlsxwriter") as _:
# #                 pass
# #             return xlsx_file

# #         used = set()

# #         def sheet_name(raw: str) -> str:
# #             """Garante nome de planilha único e <= 31 caracteres."""
# #             name = (raw or "Sheet")[:31] or "Sheet"
# #             base = name
# #             i = 1
# #             while name in used:
# #                 suffix = f"_{i}"
# #                 name = base[: 31 - len(suffix)] + suffix
# #                 i += 1
# #             used.add(name)
# #             return name

# #         def table_name_from_sheet(sname: str, used_tables: set) -> str:
# #             """
# #             Gera um nome de tabela válido e único para o Excel:
# #             - começa com letra/underscore
# #             - só letras, números e underscore
# #             - único no arquivo
# #             """
# #             import re

# #             base = re.sub(r"[^A-Za-z0-9_]", "_", sname)
# #             if not base:
# #                 base = "TB"
# #             if not (base[0].isalpha() or base[0] == "_"):
# #                 base = f"TB_{base}"
# #             name = f"TB_{base}".upper()

# #             cand = name
# #             i = 1
# #             while cand in used_tables:
# #                 cand = f"{name}_{i}"
# #                 i += 1

# #             used_tables.add(cand)
# #             return cand

# #         used_tables = set()

# #         # IMPORTANTE: usar xlsxwriter para poder criar a Tabela do Excel
# #         with pd.ExcelWriter(xlsx_file, engine="xlsxwriter") as writer:
# #             for t in tables:
# #                 df = pd.read_sql(text(f'SELECT * FROM "{t}"'), conn)
# #                 sname = sheet_name(t)
# #                 df.to_excel(writer, sheet_name=sname, index=False)

# #                 worksheet = writer.sheets[sname]

# #                 linhas, colunas = df.shape
# #                 if colunas == 0:
# #                     # não cria tabela se não há colunas
# #                     print(f"   • {t} → aba '{sname}': 0 coluna(s) (tabela não criada)")
# #                     continue

# #                 tb_name = table_name_from_sheet(sname, used_tables)

# #                 # Cria TABELA real do Excel (ListObject) — sem formatação de células extra
# #                 worksheet.add_table(
# #                     0, 0,
# #                     max(linhas, 1), colunas - 1,
# #                     {
# #                         "name": tb_name,
# #                         "columns": [{"header": col} for col in df.columns],
# #                         "style": "Table Style Medium 2",
# #                     }
# #                 )

# #                 print(f"   • {t} → aba '{sname}': {len(df)} linha(s) | tabela: {tb_name}")

# #     print("   ✔ Excel criado com sucesso.")
# #     return xlsx_file


# # def main():
# #     sql_file = backup_sql_via_pg_dump()
# #     xlsx_file = export_to_excel()
# #     print("\n✅ Backup COMPLETO concluído!")
# #     print(f"   - SQL:  {sql_file}")
# #     print(f"   - XLSX: {xlsx_file}")


# # def agendar_semana(hora: str):
# #     """Agenda seg–sex no horário informado (HH:MM)."""
# #     schedule.clear()
# #     schedule.every().monday.at(hora).do(main)
# #     schedule.every().tuesday.at(hora).do(main)
# #     schedule.every().wednesday.at(hora).do(main)
# #     schedule.every().thursday.at(hora).do(main)
# #     schedule.every().friday.at(hora).do(main)
# #     print(f"⏳ Agendado para seg–sex às {hora}.")


# # def kickoff_se_passou(hora: str):
# #     """Se já passou do horário de hoje (dia útil), executa uma vez agora."""
# #     now = dt.datetime.now()
# #     eh_dia_util = now.weekday() < 5
# #     alvo = dt.datetime.strptime(hora, "%H:%M").time()
# #     if eh_dia_util and now.time() > alvo:
# #         print("⚠️ Já passou do horário de hoje — executando uma vez agora (kickoff).")
# #         try:
# #             main()
# #         except Exception as e:
# #             print("Falha no kickoff:", e)


# # def parse_args():
# #     ap = argparse.ArgumentParser(
# #         description="Backup COMPLETO do banco (SQL + Excel)."
# #     )
# #     ap.add_argument(
# #         "--hora",
# #         default="09:00",
# #         help="Horário (24h) para rodar seg–sex, formato HH:MM. Padrão: 09:00",
# #     )
# #     ap.add_argument(
# #         "--once",
# #         action="store_true",
# #         help="Executa o backup imediatamente e sai (não agenda).",
# #     )
# #     ap.add_argument(
# #         "--no-kickoff",
# #         action="store_true",
# #         help="Não executa o kickoff mesmo que já tenha passado do horário hoje.",
# #     )
# #     return ap.parse_args()


# # if __name__ == "__main__":
# #     args = parse_args()

# #     if args.once:
# #         main()
# #     else:
# #         agendar_semana(args.hora)
# #         if not args.no_kickoff:
# #             kickoff_se_passou(args.hora)

# #         try:
# #             while True:
# #                 schedule.run_pending()
# #                 time.sleep(30)
# #         except KeyboardInterrupt:
# #             print("\n🛑 Encerrado pelo usuário.")


# # backup_full_clientes.py
# import os
# import shutil
# import subprocess
# import datetime as dt
# from pathlib import Path
# from urllib.parse import quote_plus
# import argparse
# import time
# import re

# import pandas as pd
# from sqlalchemy import create_engine, text
# import schedule

# # ==== CONFIGURAÇÕES ==========================================================
# USER = os.getenv("DB_USER", "cafeappdb_8cz2_user")
# PASSWORD = os.getenv("DB_PASSWORD", "OZUlAW7ag7mdgTwerY0N1UqbDGFyqkVL")
# HOST = os.getenv("DB_HOST", "dpg-d4njnpfpm1nc73e92tmg-a.oregon-postgres.render.com")
# PORT = int(os.getenv("DB_PORT", "5432"))
# DBNAME = os.getenv("DB_NAME", "cafeappdb_8cz2")

# # Pasta RAIZ onde ficam as pastas de backup dos clientes
# BACKUP_ROOT = Path(os.getenv("BACKUP_ROOT", r"G:\Meu Drive\Python\Fazendas\Backup"))
# BACKUP_ROOT.mkdir(parents=True, exist_ok=True)

# # Clientes (pasta -> nome no DB)
# CLIENTES = {
#     "Agrocoffee": "Agrocoffee",
#     "Sergio_Lucas": "Sérgio e Lucas",
# }

# # Caminho do pg_dump (PostgreSQL 18)
# PG_DUMP = os.getenv("PG_DUMP", r"C:\Program Files\PostgreSQL\18\bin\pg_dump.exe")

# PSQL_URL = (
#     f"postgresql://{USER}:{quote_plus(PASSWORD)}"
#     f"@{HOST}:{PORT}/{DBNAME}?sslmode=require"
# )

# SQLA_URL = (
#     f"postgresql+psycopg2://{USER}:{quote_plus(PASSWORD)}"
#     f"@{HOST}:{PORT}/{DBNAME}"
# )
# # ============================================================================


# def _garante_pg_dump():
#     """Verifica se o pg_dump existe ou tenta localizar no PATH."""
#     if Path(PG_DUMP).exists():
#         return PG_DUMP
#     found = shutil.which("pg_dump")
#     if found:
#         return found
#     raise FileNotFoundError(
#         "pg_dump não encontrado. Ajuste a variável PG_DUMP ou adicione ao PATH."
#     )


# def backup_sql_via_pg_dump(backup_dir: Path):
#     """Gera um dump .sql completo do banco (em backup_dir)."""
#     ts = dt.datetime.now().strftime("%Y-%m-%d_%H%M%S")
#     sql_file = backup_dir / f"backup_{ts}.sql"

#     print(f"[SQL] Gerando dump .sql em: {sql_file}")
#     env = os.environ.copy()
#     env["PGPASSWORD"] = PASSWORD

#     cmd = [
#         _garante_pg_dump(),
#         "--no-owner",
#         "--no-privileges",
#         "--format=plain",
#         "--dbname",
#         PSQL_URL,
#         "--file",
#         str(sql_file),
#     ]

#     try:
#         subprocess.run(cmd, check=True, env=env)
#     finally:
#         env.pop("PGPASSWORD", None)

#     print("   ✔ Dump .sql criado com sucesso.")
#     return sql_file


# def obter_cliente_id(conn, cliente_nome: str) -> str:
#     row = conn.execute(
#         text(
#             """
#             SELECT id
#             FROM clientes
#             WHERE cliente = :cliente
#             LIMIT 1
#             """
#         ),
#         {"cliente": cliente_nome},
#     ).mappings().first()

#     if not row:
#         raise RuntimeError(f"Cliente '{cliente_nome}' não encontrado na tabela clientes.")

#     return str(row["id"])


# def _sheet_name_factory():
#     used = set()

#     def sheet_name(raw: str) -> str:
#         """Garante nome de planilha único e <= 31 caracteres."""
#         name = (raw or "Sheet")[:31] or "Sheet"
#         base = name
#         i = 1
#         while name in used:
#             suffix = f"_{i}"
#             name = base[: 31 - len(suffix)] + suffix
#             i += 1
#         used.add(name)
#         return name

#     return sheet_name


# def _table_name_from_sheet(sname: str, used_tables: set) -> str:
#     """
#     Gera um nome de tabela válido e único para o Excel:
#     - começa com letra/underscore
#     - só letras, números e underscore
#     - único no arquivo
#     """
#     base = re.sub(r"[^A-Za-z0-9_]", "_", sname)
#     if not base:
#         base = "TB"
#     if not (base[0].isalpha() or base[0] == "_"):
#         base = f"TB_{base}"
#     name = f"TB_{base}".upper()

#     cand = name
#     i = 1
#     while cand in used_tables:
#         cand = f"{name}_{i}"
#         i += 1

#     used_tables.add(cand)
#     return cand


# def _tabela_tem_coluna(conn, tabela: str, coluna: str) -> bool:
#     return bool(
#         conn.execute(
#             text(
#                 """
#                 SELECT 1
#                 FROM information_schema.columns
#                 WHERE table_schema='public'
#                   AND table_name=:t
#                   AND column_name=:c
#                 LIMIT 1
#                 """
#             ),
#             {"t": tabela, "c": coluna},
#         ).scalar()
#     )


# def export_to_excel_por_cliente(conn, backup_dir: Path, cliente_nome_db: str):
#     """
#     Exporta TODAS as tabelas do schema public para um Excel em backup_dir,
#     criando Tabela do Excel em cada aba.
#     Se a tabela tiver a coluna cliente_id, filtra pelo cliente.
#     """
#     ts = dt.datetime.now().strftime("%Y-%m-%d_%H%M%S")
#     xlsx_file = backup_dir / f"backup_{cliente_nome_db}_realizado_{ts}.xlsx"

#     print(f"[XLSX] Exportando dados para Excel (cliente: {cliente_nome_db}) -> {xlsx_file}")

#     tables = (
#         conn.execute(
#             text(
#                 """
#                 SELECT table_name
#                 FROM information_schema.tables
#                 WHERE table_schema='public' AND table_type='BASE TABLE'
#                 ORDER BY table_name
#                 """
#             )
#         )
#         .scalars()
#         .all()
#     )

#     if not tables:
#         print("   ⚠ Nenhuma tabela encontrada no schema 'public'.")
#         with pd.ExcelWriter(xlsx_file, engine="xlsxwriter") as _:
#             pass
#         return xlsx_file

#     cliente_id = obter_cliente_id(conn, cliente_nome_db)

#     sheet_name = _sheet_name_factory()
#     used_tables = set()

#     with pd.ExcelWriter(xlsx_file, engine="xlsxwriter") as writer:
#         for t in tables:
#             tem_cliente_id = _tabela_tem_coluna(conn, t, "cliente_id")

#             if tem_cliente_id:
#                 df = pd.read_sql(
#                     text(f'SELECT * FROM "{t}" WHERE cliente_id = :cid'),
#                     conn,
#                     params={"cid": cliente_id},
#                 )
#             else:
#                 # tabelas "globais" (ex.: usuarios, etc.) — vai inteiro mesmo
#                 df = pd.read_sql(text(f'SELECT * FROM "{t}"'), conn)

#             sname = sheet_name(t)
#             df.to_excel(writer, sheet_name=sname, index=False)

#             worksheet = writer.sheets[sname]
#             linhas, colunas = df.shape

#             if colunas == 0:
#                 print(f"   • {t} → aba '{sname}': 0 coluna(s) (tabela não criada)")
#                 continue

#             tb_name = _table_name_from_sheet(sname, used_tables)

#             worksheet.add_table(
#                 0,
#                 0,
#                 max(linhas, 1),
#                 colunas - 1,
#                 {
#                     "name": tb_name,
#                     "columns": [{"header": col} for col in df.columns],
#                     "style": "Table Style Medium 2",
#                 },
#             )

#             tag = "FILTRADO" if tem_cliente_id else "GLOBAL"
#             print(
#                 f"   • {t} ({tag}) → aba '{sname}': {len(df)} linha(s) | tabela: {tb_name}"
#             )

#     print("   ✔ Excel criado com sucesso.")
#     return xlsx_file


# def main():
#     """
#     1) Dump SQL (uma vez) no primeiro cliente (ou numa pasta 'Banco', se preferir)
#     2) Excel por cliente (um arquivo por cliente)
#     """
#     engine = create_engine(
#         SQLA_URL,
#         connect_args={"sslmode": "require"},
#         pool_pre_ping=True,
#     )

#     # garante pastas
#     backup_dirs = {}
#     for pasta_cliente, _cliente_nome_db in CLIENTES.items():
#         d = BACKUP_ROOT / pasta_cliente
#         d.mkdir(parents=True, exist_ok=True)
#         backup_dirs[pasta_cliente] = d

#     # 1) SQL dump (uma vez) — salva na pasta do primeiro cliente (ou você pode mudar)
#     primeiro_cliente = next(iter(CLIENTES.keys()))
#     sql_file = backup_sql_via_pg_dump(backup_dirs[primeiro_cliente])

#     # 2) Excel por cliente
#     xlsx_files = []
#     with engine.connect() as conn:
#         for pasta_cliente, cliente_nome_db in CLIENTES.items():
#             xlsx_files.append(
#                 export_to_excel_por_cliente(conn, backup_dirs[pasta_cliente], cliente_nome_db)
#             )

#     print("\n✅ Backup COMPLETO concluído!")
#     print(f"   - SQL:  {sql_file}")
#     for x in xlsx_files:
#         print(f"   - XLSX: {x}")


# def agendar_semana(hora: str):
#     """Agenda seg–sex no horário informado (HH:MM)."""
#     schedule.clear()
#     schedule.every().monday.at(hora).do(main)
#     schedule.every().tuesday.at(hora).do(main)
#     schedule.every().wednesday.at(hora).do(main)
#     schedule.every().thursday.at(hora).do(main)
#     schedule.every().friday.at(hora).do(main)
#     print(f"⏳ Agendado para seg–sex às {hora}.")


# def kickoff_se_passou(hora: str):
#     """Se já passou do horário de hoje (dia útil), executa uma vez agora."""
#     now = dt.datetime.now()
#     eh_dia_util = now.weekday() < 5
#     alvo = dt.datetime.strptime(hora, "%H:%M").time()
#     if eh_dia_util and now.time() > alvo:
#         print("⚠️ Já passou do horário de hoje — executando uma vez agora (kickoff).")
#         try:
#             main()
#         except Exception as e:
#             print("Falha no kickoff:", e)


# def parse_args():
#     ap = argparse.ArgumentParser(description="Backup COMPLETO do banco (SQL + Excel por cliente).")
#     ap.add_argument(
#         "--hora",
#         default="09:00",
#         help="Horário (24h) para rodar seg–sex, formato HH:MM. Padrão: 09:00",
#     )
#     ap.add_argument(
#         "--once",
#         action="store_true",
#         help="Executa o backup imediatamente e sai (não agenda).",
#     )
#     ap.add_argument(
#         "--no-kickoff",
#         action="store_true",
#         help="Não executa o kickoff mesmo que já tenha passado do horário hoje.",
#     )
#     return ap.parse_args()


# if __name__ == "__main__":
#     args = parse_args()

#     if args.once:
#         main()
#     else:
#         agendar_semana(args.hora)
#         if not args.no_kickoff:
#             kickoff_se_passou(args.hora)

#         try:
#             while True:
#                 schedule.run_pending()
#                 time.sleep(30)
#         except KeyboardInterrupt:
#             print("\n🛑 Encerrado pelo usuário.")

# backup_full_multicliente.py
import os
import shutil
import subprocess
import datetime as dt
from pathlib import Path
from urllib.parse import quote_plus
import argparse
import time
import re

import pandas as pd
from sqlalchemy import create_engine, text
import schedule

# ==== CONFIGURAÇÕES ==========================================================
USER = os.getenv("DB_USER", "cafeappdb_8cz2_user")
PASSWORD = os.getenv("DB_PASSWORD", "OZUlAW7ag7mdgTwerY0N1UqbDGFyqkVL")
HOST = os.getenv("DB_HOST", "dpg-d4njnpfpm1nc73e92tmg-a.oregon-postgres.render.com")
PORT = int(os.getenv("DB_PORT", "5432"))
DBNAME = os.getenv("DB_NAME", "cafeappdb_8cz2")

# Pasta RAIZ onde ficam as pastas de backup de cada cliente
BACKUP_ROOT = Path(os.getenv("BACKUP_ROOT", r"G:\Meu Drive\Python\Fazendas\Backup"))
BACKUP_ROOT.mkdir(parents=True, exist_ok=True)

# Caminho do pg_dump (PostgreSQL 18)
PG_DUMP = os.getenv("PG_DUMP", r"C:\Program Files\PostgreSQL\18\bin\pg_dump.exe")

PSQL_URL = (
    f"postgresql://{USER}:{quote_plus(PASSWORD)}"
    f"@{HOST}:{PORT}/{DBNAME}?sslmode=require"
)

SQLA_URL = (
    f"postgresql+psycopg2://{USER}:{quote_plus(PASSWORD)}"
    f"@{HOST}:{PORT}/{DBNAME}"
)

# Clientes que você quer gerar backup:
# - chave: nome da pasta
# - value: nome do cliente COMO ESTÁ na tabela clientes (coluna "cliente")
CLIENTES = {
    "Agrocoffee": "Agrocoffee",
    "Sergio_Lucas": "Sérgio e Lucas",
}
# ============================================================================


def _garante_pg_dump():
    """Verifica se o pg_dump existe ou tenta localizar no PATH."""
    if Path(PG_DUMP).exists():
        return PG_DUMP
    found = shutil.which("pg_dump")
    if found:
        return found
    raise FileNotFoundError(
        "pg_dump não encontrado. Ajuste a variável PG_DUMP ou adicione ao PATH."
    )


def obter_cliente_id(conn, cliente_nome_db: str) -> str:
    row = conn.execute(
        text(
            """
            SELECT id
            FROM clientes
            WHERE cliente = :cliente
            LIMIT 1
            """
        ),
        {"cliente": cliente_nome_db},
    ).mappings().first()

    if not row:
        raise RuntimeError(f"Cliente '{cliente_nome_db}' não encontrado na tabela clientes.")
    return str(row["id"])


def backup_sql_via_pg_dump(backup_dir: Path, pasta_cliente: str):
    """Gera um dump .sql completo do banco (em backup_dir) com nome separado por cliente."""
    ts = dt.datetime.now().strftime("%Y-%m-%d_%H%M%S")
    sql_file = backup_dir / f"backup_{pasta_cliente}_{ts}.sql"

    print(f"[SQL] Gerando dump .sql em: {sql_file}")
    env = os.environ.copy()
    env["PGPASSWORD"] = PASSWORD

    cmd = [
        _garante_pg_dump(),
        "--no-owner",
        "--no-privileges",
        "--format=plain",
        "--dbname",
        PSQL_URL,
        "--file",
        str(sql_file),
    ]

    try:
        subprocess.run(cmd, check=True, env=env)
    finally:
        env.pop("PGPASSWORD", None)

    print("   ✔ Dump .sql criado com sucesso.")
    return sql_file


def _sheet_name(raw: str, used: set) -> str:
    """Garante nome de planilha único e <= 31 caracteres."""
    name = (raw or "Sheet")[:31] or "Sheet"
    base = name
    i = 1
    while name in used:
        suffix = f"_{i}"
        name = base[: 31 - len(suffix)] + suffix
        i += 1
    used.add(name)
    return name


def _table_name_from_sheet(sname: str, used_tables: set) -> str:
    """
    Gera nome de tabela válido e único:
    - começa com letra/underscore
    - só letras, números e underscore
    - único no arquivo
    """
    base = re.sub(r"[^A-Za-z0-9_]", "_", sname)
    if not base:
        base = "TB"
    if not (base[0].isalpha() or base[0] == "_"):
        base = f"TB_{base}"
    name = f"TB_{base}".upper()

    cand = name
    i = 1
    while cand in used_tables:
        cand = f"{name}_{i}"
        i += 1

    used_tables.add(cand)
    return cand


def _tabela_tem_coluna_cliente_id(conn, table_name: str) -> bool:
    """Retorna True se a tabela tiver coluna cliente_id."""
    cols = conn.execute(
        text(
            """
            SELECT column_name
            FROM information_schema.columns
            WHERE table_schema='public' AND table_name=:t
            """
        ),
        {"t": table_name},
    ).scalars().all()

    return "cliente_id" in set(cols)


def export_to_excel_por_cliente(backup_dir: Path, pasta_cliente: str, cliente_nome_db: str):
    """
    Exporta todas as tabelas public para um Excel em backup_dir.
    - Se a tabela tiver cliente_id -> filtra por cliente_id
    - Senão -> exporta inteiro
    Mantém Tabela do Excel (Table Style Medium 2) em cada aba.
    """
    ts = dt.datetime.now().strftime("%Y-%m-%d_%H%M%S")
    xlsx_file = backup_dir / f"backup_{pasta_cliente}_{ts}.xlsx"

    print(f"[XLSX] Exportando dados para: {xlsx_file}")

    engine = create_engine(
        SQLA_URL,
        connect_args={"sslmode": "require"},
        pool_pre_ping=True,
    )

    with engine.connect() as conn:
        cliente_id = obter_cliente_id(conn, cliente_nome_db)

        tables = conn.execute(
            text(
                """
                SELECT table_name
                FROM information_schema.tables
                WHERE table_schema='public' AND table_type='BASE TABLE'
                ORDER BY table_name
                """
            )
        ).scalars().all()

        if not tables:
            print("   ⚠ Nenhuma tabela encontrada no schema 'public'.")
            with pd.ExcelWriter(xlsx_file, engine="xlsxwriter") as _:
                pass
            return xlsx_file

        used_sheets = set()
        used_tables = set()

        with pd.ExcelWriter(xlsx_file, engine="xlsxwriter") as writer:
            for t in tables:
                tem_cliente_id = _tabela_tem_coluna_cliente_id(conn, t)

                if tem_cliente_id:
                    df = pd.read_sql(
                        text(f'SELECT * FROM "{t}" WHERE cliente_id = :cid'),
                        conn,
                        params={"cid": cliente_id},
                    )
                else:
                    df = pd.read_sql(text(f'SELECT * FROM "{t}"'), conn)

                sname = _sheet_name(t, used_sheets)
                df.to_excel(writer, sheet_name=sname, index=False)

                worksheet = writer.sheets[sname]
                linhas, colunas = df.shape

                if colunas == 0:
                    print(f"   • {t} → aba '{sname}': 0 coluna(s) (tabela não criada)")
                    continue

                tb_name = _table_name_from_sheet(sname, used_tables)

                worksheet.add_table(
                    0, 0,
                    max(linhas, 1), colunas - 1,
                    {
                        "name": tb_name,
                        "columns": [{"header": col} for col in df.columns],
                        "style": "Table Style Medium 2",
                    }
                )

                tag = "FILTRADO" if tem_cliente_id else "FULL"
                print(f"   • {t} [{tag}] → aba '{sname}': {len(df)} linha(s) | tabela: {tb_name}")

    print("   ✔ Excel criado com sucesso.")
    return xlsx_file


def executar_backup_cliente(pasta_cliente: str, cliente_nome_db: str):
    """Executa SQL + XLSX para um cliente (em pasta separada)."""
    backup_dir = BACKUP_ROOT / pasta_cliente
    backup_dir.mkdir(parents=True, exist_ok=True)

    print("\n============================================================")
    print(f"Cliente: {cliente_nome_db}  |  Pasta: {backup_dir}")
    print("============================================================")

    sql_file = backup_sql_via_pg_dump(backup_dir, pasta_cliente)
    xlsx_file = export_to_excel_por_cliente(backup_dir, pasta_cliente, cliente_nome_db)

    print("✅ Backup concluído para o cliente.")
    print(f"   - SQL:  {sql_file}")
    print(f"   - XLSX: {xlsx_file}")


def main():
    for pasta_cliente, cliente_nome_db in CLIENTES.items():
        try:
            executar_backup_cliente(pasta_cliente, cliente_nome_db)
        except Exception as e:
            print(f"❌ Falha no backup do cliente {cliente_nome_db}: {e}")


def agendar_semana(hora: str):
    """Agenda seg–sex no horário informado (HH:MM)."""
    schedule.clear()
    schedule.every().monday.at(hora).do(main)
    schedule.every().tuesday.at(hora).do(main)
    schedule.every().wednesday.at(hora).do(main)
    schedule.every().thursday.at(hora).do(main)
    schedule.every().friday.at(hora).do(main)
    print(f"⏳ Agendado para seg–sex às {hora}.")


def kickoff_se_passou(hora: str):
    """Se já passou do horário de hoje (dia útil), executa uma vez agora."""
    now = dt.datetime.now()
    eh_dia_util = now.weekday() < 5
    alvo = dt.datetime.strptime(hora, "%H:%M").time()
    if eh_dia_util and now.time() > alvo:
        print("⚠️ Já passou do horário de hoje — executando uma vez agora (kickoff).")
        try:
            main()
        except Exception as e:
            print("Falha no kickoff:", e)


def parse_args():
    ap = argparse.ArgumentParser(description="Backup COMPLETO multi-cliente (SQL + Excel).")
    ap.add_argument(
        "--hora",
        default="09:00",
        help="Horário (24h) para rodar seg–sex, formato HH:MM. Padrão: 09:00",
    )
    ap.add_argument(
        "--once",
        action="store_true",
        help="Executa o backup imediatamente e sai (não agenda).",
    )
    ap.add_argument(
        "--no-kickoff",
        action="store_true",
        help="Não executa o kickoff mesmo que já tenha passado do horário hoje.",
    )
    return ap.parse_args()


if __name__ == "__main__":
    args = parse_args()

    if args.once:
        main()
    else:
        agendar_semana(args.hora)
        if not args.no_kickoff:
            kickoff_se_passou(args.hora)

        try:
            while True:
                schedule.run_pending()
                time.sleep(30)
        except KeyboardInterrupt:
            print("\n🛑 Encerrado pelo usuário.")
