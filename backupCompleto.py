# backup_agrocoffee_full.py
import os
import shutil
import subprocess
import datetime as dt
from pathlib import Path
from urllib.parse import quote_plus
import argparse
import time

import pandas as pd
from sqlalchemy import create_engine, text
import schedule

# ==== CONFIGURAÇÕES ==========================================================
USER = os.getenv("DB_USER", "cafeappdb_8cz2_user")
PASSWORD = os.getenv("DB_PASSWORD", "OZUlAW7ag7mdgTwerY0N1UqbDGFyqkVL")
HOST = os.getenv(
    "DB_HOST",
    "dpg-d4njnpfpm1nc73e92tmg-a.oregon-postgres.render.com"
)
PORT = int(os.getenv("DB_PORT", "5432"))
DBNAME = os.getenv("DB_NAME", "cafeappdb_8cz2")

# Pasta de backup (histórico .sql e .xlsx)
BACKUP_DIR = Path(
    os.getenv(
        "BACKUP_DIR",
        r"G:\Meu Drive\Python\Fazendas\Backup\Agrocoffee"
    )
)
BACKUP_DIR.mkdir(parents=True, exist_ok=True)

# Caminho do pg_dump (PostgreSQL 18)
PG_DUMP = os.getenv(
    "PG_DUMP",
    r"C:\Program Files\PostgreSQL\18\bin\pg_dump.exe"
)

PSQL_URL = (
    f"postgresql://{USER}:{quote_plus(PASSWORD)}"
    f"@{HOST}:{PORT}/{DBNAME}?sslmode=require"
)

SQLA_URL = (
    f"postgresql+psycopg2://{USER}:{quote_plus(PASSWORD)}"
    f"@{HOST}:{PORT}/{DBNAME}"
)

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


def backup_sql_via_pg_dump():
    """Gera um dump .sql completo do banco (em BACKUP_DIR)."""
    ts = dt.datetime.now().strftime("%Y-%m-%d_%H%M%S")
    sql_file = BACKUP_DIR / f"backup_{ts}.sql"

    print(f"[1/2] Gerando dump .sql em: {sql_file}")
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


def export_to_excel():
    """Exporta TODAS as tabelas do schema public para um Excel em BACKUP_DIR."""
    ts = dt.datetime.now().strftime("%Y-%m-%d_%H%M%S")
    xlsx_file = BACKUP_DIR / f"backup_realizado_{ts}.xlsx"

    print(f"[2/2] Exportando dados para Excel: {xlsx_file}")
    engine = create_engine(
        SQLA_URL,
        connect_args={"sslmode": "require"},
        pool_pre_ping=True,
    )

    with engine.connect() as conn:
        tables = (
            conn.execute(
                text(
                    """
                    SELECT table_name
                    FROM information_schema.tables
                    WHERE table_schema='public' AND table_type='BASE TABLE'
                    ORDER BY table_name
                    """
                )
            )
            .scalars()
            .all()
        )

        if not tables:
            print("   ⚠ Nenhuma tabela encontrada no schema 'public'.")
            with pd.ExcelWriter(xlsx_file) as _:
                pass
            return xlsx_file

        used = set()

        def sheet_name(raw: str) -> str:
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

        with pd.ExcelWriter(xlsx_file) as writer:
            for t in tables:
                df = pd.read_sql(text(f'SELECT * FROM "{t}"'), conn)
                sname = sheet_name(t)  # aqui NÃO renomeamos 'realizado'
                df.to_excel(writer, sheet_name=sname, index=False)
                print(f"   • {t} → aba '{sname}': {len(df)} linha(s)")

    print("   ✔ Excel criado com sucesso.")
    return xlsx_file


def main():
    sql_file = backup_sql_via_pg_dump()
    xlsx_file = export_to_excel()
    print("\n✅ Backup COMPLETO concluído!")
    print(f"   - SQL:  {sql_file}")
    print(f"   - XLSX: {xlsx_file}")


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
    ap = argparse.ArgumentParser(
        description="Backup COMPLETO do banco (SQL + Excel)."
    )
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
