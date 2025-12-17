import os
import datetime as dt
from pathlib import Path
from urllib.parse import quote_plus

import pandas as pd
from sqlalchemy import create_engine, text


# =============================================================================
# CONFIGURAÇÕES DO BANCO
# =============================================================================
USER = os.getenv("DB_USER", "cafeappdb_8cz2_user")
PASSWORD = os.getenv("DB_PASSWORD", "OZUlAW7ag7mdgTwerY0N1UqbDGFyqkVL")
HOST = os.getenv("DB_HOST", "dpg-d4njnpfpm1nc73e92tmg-a.oregon-postgres.render.com")
PORT = int(os.getenv("DB_PORT", "5432"))
DBNAME = os.getenv("DB_NAME", "cafeappdb_8cz2")

SQLA_URL = (
    f"postgresql+psycopg2://{USER}:{quote_plus(PASSWORD)}"
    f"@{HOST}:{PORT}/{DBNAME}"
)

# =============================================================================
# PASTA RAIZ
# =============================================================================
EXECUTAVEL_ROOT = Path(
    os.getenv("EXECUTAVEL_ROOT", r"G:\Meu Drive\Python\Fazendas\Executavel")
)
EXECUTAVEL_ROOT.mkdir(parents=True, exist_ok=True)

# =============================================================================
# CLIENTES + FAZENDAS (IDs EXPLÍCITOS)
# =============================================================================
CLIENTES = {
    "Agrocoffee": {
        "cliente_db": "Agrocoffee",
        "cliente_id": "096da0b8-b4cf-4dd4-96df-782c9febb2f1",
        "fazenda_id": "eddf70d8-215f-4065-8fed-9d392ccec032",
    },
    "Sergio_Lucas": {
        "cliente_db": "Sérgio e Lucas",
        "cliente_id": "dbec624c-1cd7-46cd-8a13-1841fc1f6194",
        "fazenda_id": "8f756585-5f63-49e0-8ff9-601460154a74",
    },
    "Sergio_Lucas_F": {
        "cliente_db": "Sérgio e Lucas",
        "cliente_id": "dbec624c-1cd7-46cd-8a13-1841fc1f6194",
        "fazenda_id": "0d29f6e6-dcb7-4657-9c20-4a69fc917aa3",
    },
}


# =============================================================================
# DIAGNÓSTICO: INFO DO BANCO
# =============================================================================
def mostrar_info_banco(conn):
    info = conn.execute(
        text("""
            SELECT
                current_database() AS db,
                inet_server_addr() AS server_ip,
                inet_server_port() AS server_port,
                current_user AS user,
                version() AS version
        """)
    ).mappings().first()

    print("\n================ INFO DO BANCO (onde o script está conectado) ================")
    print(f"DB.............: {info['db']}")
    print(f"Server IP......: {info['server_ip']}")
    print(f"Server Port....: {info['server_port']}")
    print(f"User...........: {info['user']}")
    print(f"Version........: {str(info['version'])[:120]}...")
    print("==============================================================================")


# =============================================================================
# DIAGNÓSTICO: RESUMO POR CLIENTE+FAZENDA
# =============================================================================
def mostrar_resumo_realizado(df_realizado: pd.DataFrame):
    print("\n================ RESUMO REALIZADO (cliente_id x fazenda_id) ==================")
    if df_realizado.empty:
        print("Tabela realizado veio vazia.")
        print("==============================================================================")
        return

    resumo = (
        df_realizado
        .assign(
            cliente_id=df_realizado["cliente_id"].astype(str),
            fazenda_id=df_realizado["fazenda_id"].astype(str),
        )
        .groupby(["cliente_id", "fazenda_id"], dropna=False)
        .size()
        .reset_index(name="qtd")
        .sort_values("qtd", ascending=False)
    )

    print(resumo.to_string(index=False))
    print("==============================================================================")


# =============================================================================
# TRANSFORMAÇÃO DO DATAFRAME (PADRONIZA EXCEL)
# =============================================================================
def transformar_dataframe(df: pd.DataFrame, cliente_nome: str) -> pd.DataFrame:
    if df.empty:
        # mantém cabeçalho padrão mesmo quando não tem linhas
        return pd.DataFrame(columns=[
            "SAFRAS", "DATA", "LAVOURAS", "SERVIÇOS", "PRODUTOS", "UNI",
            "Qtde TOTAL", "Ok", "CLIENTES", "ANO", "MÊS", "DIA"
        ])

    df["data"] = pd.to_datetime(df["data"], errors="coerce")
    df["ANO"] = df["data"].dt.year
    df["MÊS"] = df["data"].dt.month
    df["DIA"] = df["data"].dt.day
    df["DATA"] = df["data"].dt.strftime("%d/%m/%Y")

    df["CLIENTES"] = cliente_nome

    df = df.rename(columns={
        "safra": "SAFRAS",
        "lavoura": "LAVOURAS",
        "servico": "SERVIÇOS",
        "produto": "PRODUTOS",
        "unidade": "UNI",
        "quantidade": "Qtde TOTAL",
        "status": "Ok",
    })

    if "Ok" in df.columns:
        df["Ok"] = (
            df["Ok"]
            .astype(str)
            .str.lower()
            .map({"realizado": "Ok", "cancelado": "Cancelado"})
            .fillna(df["Ok"])
        )

    # remove colunas técnicas
    df = df.drop(
        columns=[c for c in ["id", "usuario_id", "cliente_id", "fazenda_id", "criado_em", "data"] if c in df.columns],
        errors="ignore",
    )

    ordem = [
        "SAFRAS", "DATA", "LAVOURAS", "SERVIÇOS", "PRODUTOS", "UNI",
        "Qtde TOTAL", "Ok", "CLIENTES", "ANO", "MÊS", "DIA"
    ]
    cols = [c for c in ordem if c in df.columns]
    return df[cols]


# =============================================================================
# EXPORTAÇÃO EXCEL COM TABELA
# =============================================================================
def exportar_excel_com_tabela(df: pd.DataFrame, caminho_xlsx: Path):
    with pd.ExcelWriter(caminho_xlsx, engine="xlsxwriter") as writer:
        df.to_excel(writer, sheet_name="Lançamentos", index=False)
        ws = writer.sheets["Lançamentos"]

        linhas, colunas = df.shape
        if colunas == 0:
            return

        ws.add_table(
            0, 0,
            max(linhas, 1),
            colunas - 1,
            {
                "name": "TB_LANCAMENTOS",
                "columns": [{"header": c} for c in df.columns],
                "style": "Table Style Medium 2",
            },
        )


# =============================================================================
# MAIN
# =============================================================================
def main():
    engine = create_engine(
        SQLA_URL,
        connect_args={"sslmode": "require"},
        pool_pre_ping=True,
    )

    with engine.connect() as conn:
        # 1) Mostra de qual banco está vindo
        mostrar_info_banco(conn)

        # 2) Baixa a tabela toda UMA vez
        print("\n================ BAIXANDO TABELA REALIZADO =================")
        df_realizado = pd.read_sql(text("SELECT * FROM realizado"), conn)
        print(f"Total de registros baixados: {len(df_realizado)}")

        print("\nAmostra da tabela REALIZADO (5 primeiras linhas):")
        print(df_realizado.head(5))
        print("============================================================")

        # 3) Mostra resumo por cliente/fazenda (diagnóstico definitivo)
        mostrar_resumo_realizado(df_realizado)

        # 4) Loop por cliente + fazenda: filtra e salva REALIZADO.xlsx
        for pasta, meta in CLIENTES.items():
            cliente_dir = EXECUTAVEL_ROOT / pasta
            cliente_dir.mkdir(parents=True, exist_ok=True)

            saida = cliente_dir / "REALIZADO.xlsx"

            cid = str(meta["cliente_id"])
            fid = str(meta["fazenda_id"])

            print(f"\n---------------- PROCESSANDO {pasta} ----------------")
            print(f"cliente_id : {cid}")
            print(f"fazenda_id : {fid}")

            df_filtrado = df_realizado[
                (df_realizado["cliente_id"].astype(str) == cid) &
                (df_realizado["fazenda_id"].astype(str) == fid)
            ].copy()

            print(f"Registros encontrados: {len(df_filtrado)}")
            print("Amostra filtrada (3 linhas):")
            print(df_filtrado.head(3))

            df_final = transformar_dataframe(df_filtrado, meta["cliente_db"])
            exportar_excel_com_tabela(df_final, saida)

            print(f"Arquivo salvo em: {saida}")
            print("------------------------------------------------------")


if __name__ == "__main__":
    main()
