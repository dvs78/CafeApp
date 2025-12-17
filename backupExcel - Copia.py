import os
import datetime as dt
from pathlib import Path
from urllib.parse import quote_plus

import pandas as pd
from sqlalchemy import create_engine, text


# ==== CONFIGURAÇÕES ==========================================================
USER = os.getenv("DB_USER", "cafeappdb_8cz2_user")
PASSWORD = os.getenv("DB_PASSWORD", "OZUlAW7ag7mdgTwerY0N1UqbDGFyqkVL")
HOST = os.getenv(
    "DB_HOST",
    "dpg-d4njnpfpm1nc73e92tmg-a.oregon-postgres.render.com"
)
PORT = int(os.getenv("DB_PORT", "5432"))
DBNAME = os.getenv("DB_NAME", "cafeappdb_8cz2")

# Pasta RAIZ onde ficam as pastas dos clientes
EXECUTAVEL_ROOT = Path(
    os.getenv(
        "EXECUTAVEL_ROOT",
        r"G:\Meu Drive\Python\Fazendas\Executavel"
    )
)
EXECUTAVEL_ROOT.mkdir(parents=True, exist_ok=True)

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


def transformar_dataframe(df: pd.DataFrame, cliente_nome: str) -> pd.DataFrame:
    if "data" in df.columns:
        df["data"] = pd.to_datetime(df["data"], errors="coerce")
        df["ano"] = df["data"].dt.year
        df["mes"] = df["data"].dt.month
        df["dia"] = df["data"].dt.day

    # aqui agora é dinâmico por cliente
    df["clientes"] = cliente_nome

    rename_map = {
        "safra": "safras",
        "lavoura": "lavouras",
        "servico": "serviços",
        "produto": "produtos",
        "unidade": "uni",
        "quantidade": "Qtde TOTAL",
        "status": "Ok",
    }
    df = df.rename(columns=rename_map)

    if "Ok" in df.columns:
        df["Ok"] = (
            df["Ok"]
            .astype(str)
            .str.lower()
            .map({
                "realizado": "Ok",
                "cancelado": "Cancelado",
            })
            .fillna(df["Ok"])
        )

    cols_drop = ["id", "usuario_id", "cliente_id", "criado_em"]
    df = df.drop(columns=[c for c in cols_drop if c in df.columns], errors="ignore")

    if "data" in df.columns:
        df["data"] = df["data"].dt.strftime("%d/%m/%Y")

    excecoes = {"Ok", "Qtde TOTAL"}
    df.columns = [
        col if col in excecoes else col.upper()
        for col in df.columns
    ]

    if "MES" in df.columns:
        df = df.rename(columns={"MES": "MÊS"})

    ordem_preferida = [
        "SAFRAS",
        "DATA",
        "LAVOURAS",
        "SERVIÇOS",
        "PRODUTOS",
        "UNI",
        "Qtde TOTAL",
        "Ok",
        "CLIENTES",
        "ANO",
        "MÊS",
        "DIA",
    ]

    cols_exist = [c for c in ordem_preferida if c in df.columns]
    restantes = [c for c in df.columns if c not in cols_exist]

    return df[cols_exist + restantes]


def exportar_excel_com_tabela(df: pd.DataFrame, caminho_xlsx: Path):
    with pd.ExcelWriter(caminho_xlsx, engine="xlsxwriter") as writer:
        df.to_excel(writer, sheet_name="Lançamentos", index=False)

        worksheet = writer.sheets["Lançamentos"]

        linhas, colunas = df.shape

        # cria TABELA real do Excel (sem formatação de célula)
        worksheet.add_table(
            0, 0,
            max(linhas, 1), colunas - 1,
            {
                "name": "TB_LANCAMENTOS",
                "columns": [{"header": col} for col in df.columns],
                "style": "Table Style Medium 2",
            }
        )


def validar_tabela_realizado(conn):
    existe = conn.execute(
        text("""
            SELECT EXISTS (
                SELECT 1
                FROM information_schema.tables
                WHERE table_schema = 'public'
                  AND table_name = 'realizado'
            )
        """)
    ).scalar()
    if not existe:
        raise RuntimeError("Tabela 'realizado' não encontrada.")


def obter_cliente_id(conn, cliente_nome: str) -> str:
    row = conn.execute(
        text("""
            SELECT id
            FROM clientes
            WHERE cliente = :cliente
            LIMIT 1
        """),
        {"cliente": cliente_nome}
    ).mappings().first()

    if not row:
        raise RuntimeError(f"Cliente '{cliente_nome}' não encontrado na tabela clientes.")
    return str(row["id"])


def gerar_backup_lancamentos_cliente(conn, pasta_cliente: str, cliente_nome_db: str):
    cliente_dir = EXECUTAVEL_ROOT / pasta_cliente
    cliente_dir.mkdir(parents=True, exist_ok=True)

    xlsx_exec = cliente_dir / "REALIZADO.xlsx"
    agora = dt.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    print(f"\n🔄 Gerando REALIZADO.xlsx em: {xlsx_exec}")
    print(f"   Data/hora: {agora}")
    print(f"   Cliente (DB): {cliente_nome_db}")

    cliente_id = obter_cliente_id(conn, cliente_nome_db)

    df = pd.read_sql(
        text('SELECT * FROM "realizado" WHERE cliente_id = :cid'),
        conn,
        params={"cid": cliente_id}
    )

    df = transformar_dataframe(df, cliente_nome_db)
    exportar_excel_com_tabela(df, xlsx_exec)

    print("✅ REALIZADO.xlsx gerado com TABELA do Excel.")


def main():
    try:
        engine = create_engine(
            SQLA_URL,
            connect_args={"sslmode": "require"},
            pool_pre_ping=True,
        )

        with engine.connect() as conn:
            validar_tabela_realizado(conn)

            for pasta_cliente, cliente_nome_db in CLIENTES.items():
                gerar_backup_lancamentos_cliente(conn, pasta_cliente, cliente_nome_db)

    except Exception as e:
        print("❌ Erro:", e)


if __name__ == "__main__":
    main()
