import os
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
EXECUTAVEL_ROOT = Path(os.getenv("EXECUTAVEL_ROOT", r"G:\Meu Drive\Python\Fazendas\Executavel"))
EXECUTAVEL_ROOT.mkdir(parents=True, exist_ok=True)

# =============================================================================
# CLIENTES + FAZENDAS (IDs EXPLÍCITOS)
#   - A coluna CLIENTES no Excel deve ser a CHAVE do dicionário (ex: "Sergio_Lucas")
# =============================================================================
CLIENTES = {
    "Agrocoffee": {
        "cliente_db": "Agrocoffee",
        "cliente_id": "096da0b8-b4cf-4dd4-96df-782c9febb2f1",
        "fazenda_id": "eddf70d8-215f-4065-8fed-9d392ccec032",
    },
    "Sergio_Lucas": {
        "cliente_db": "Sérgio e Lucas",
        "cliente_id": "4d61d53d-6e7a-4c54-8dff-d188b9cfbefa",
        "fazenda_id": "bfe74515-08af-4231-8bdd-d8162d585605",
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
def mostrar_resumo(df: pd.DataFrame, titulo: str):
    print(f"\n================ {titulo} (cliente_id x fazenda_id) =================")
    if df.empty:
        print("Tabela veio vazia.")
        print("==============================================================================")
        return

    if "cliente_id" not in df.columns or "fazenda_id" not in df.columns:
        print("Tabela não contém cliente_id e/ou fazenda_id.")
        print("Colunas encontradas:", list(df.columns))
        print("==============================================================================")
        return

    resumo = (
        df.assign(
            cliente_id=df["cliente_id"].astype(str),
            fazenda_id=df["fazenda_id"].astype(str),
        )
        .groupby(["cliente_id", "fazenda_id"], dropna=False)
        .size()
        .reset_index(name="qtd")
        .sort_values("qtd", ascending=False)
    )

    print(resumo.to_string(index=False))
    print("==============================================================================")

# =============================================================================
# TRANSFORMAÇÃO (PADRÃO EXCEL) - LANÇAMENTOS (REALIZADO)
#   - CLIENTES = chave do objeto CLIENTES (ex: "Sergio_Lucas")
# =============================================================================
def transformar_dataframe_realizado(df: pd.DataFrame, cliente_chave: str) -> pd.DataFrame:
    if df.empty:
        return pd.DataFrame(columns=[
            "SAFRAS", "DATA", "LAVOURAS", "SERVIÇOS", "PRODUTOS", "UNI",
            "Qtde TOTAL", "Ok", "CLIENTES", "ANO", "MÊS", "DIA"
        ])

    # data
    if "data" in df.columns:
        df["data"] = pd.to_datetime(df["data"], errors="coerce")
        df["ANO"] = df["data"].dt.year
        df["MÊS"] = df["data"].dt.month
        df["DIA"] = df["data"].dt.day
        df["DATA"] = df["data"].dt.strftime("%d/%m/%Y")
    else:
        df["DATA"] = ""
        df["ANO"] = ""
        df["MÊS"] = ""
        df["DIA"] = ""

    # clientes = chave do dicionário
    df["CLIENTES"] = cliente_chave

    # renomeia
    df = df.rename(columns={
        "safra": "SAFRAS",
        "lavoura": "LAVOURAS",
        "servico": "SERVIÇOS",
        "produto": "PRODUTOS",
        "unidade": "UNI",
        "quantidade": "Qtde TOTAL",
        "status": "Ok",
    })

    # status
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
# TRANSFORMAÇÃO (PADRÃO EXCEL) - CHUVAS
#   Requisitos:
#   - FAZENDAS: vem da tabela fazendas (coluna fazenda) via join fazenda_id
#   - CHUVA: vem da tabela chuvas (coluna chuva)
#   - CLIENTES: chave do objeto CLIENTES
# =============================================================================
def transformar_dataframe_chuvas(
    df_chuvas: pd.DataFrame,
    cliente_chave: str,
    df_fazendas: pd.DataFrame,
) -> pd.DataFrame:
    colunas_saida = [
        "DATA", "FAZENDAS", "PLUVIÔMETRO", "CHUVA",
        "CLIENTES", "ANO", "MÊS", "DIA"
    ]

    if df_chuvas.empty:
        return pd.DataFrame(columns=colunas_saida)

    # ---------------- DATA
    df_chuvas["data"] = pd.to_datetime(df_chuvas.get("data"), errors="coerce")
    df_chuvas["ANO"] = df_chuvas["data"].dt.year
    df_chuvas["MÊS"] = df_chuvas["data"].dt.month
    df_chuvas["DIA"] = df_chuvas["data"].dt.day
    df_chuvas["DATA"] = df_chuvas["data"].dt.strftime("%d/%m/%Y")

    # ---------------- CLIENTES
    df_chuvas["CLIENTES"] = cliente_chave

    # ---------------- CHUVA (coluna "chuva" na tabela chuvas)
    if "chuva" in df_chuvas.columns:
        df_chuvas["CHUVA"] = df_chuvas["chuva"]
    else:
        df_chuvas["CHUVA"] = ""

    # ---------------- PLUVIÔMETRO (join em pluviometros é opcional; aqui mostramos o ID)
    # Se você quiser o "nome" do pluviômetro, precisa baixar a tabela pluviometros e mapear igual fazendas.
    if "pluviometro_id" in df_chuvas.columns:
        df_chuvas["PLUVIÔMETRO"] = df_chuvas["pluviometro_id"].astype(str)
    else:
        df_chuvas["PLUVIÔMETRO"] = ""

    # ---------------- FAZENDAS (nome vem da tabela fazendas)
    # Pelo seu print, fazendas tem colunas: id (uuid), fazenda (text), cliente_id
    if "id" in df_fazendas.columns and "fazenda" in df_fazendas.columns and "fazenda_id" in df_chuvas.columns:
        mapa_fazendas = df_fazendas.set_index(df_fazendas["id"].astype(str))["fazenda"]
        df_chuvas["FAZENDAS"] = df_chuvas["fazenda_id"].astype(str).map(mapa_fazendas).fillna("")
    else:
        df_chuvas["FAZENDAS"] = ""

    # remove colunas técnicas
    df_chuvas = df_chuvas.drop(
        columns=[c for c in ["id", "cliente_id", "fazenda_id", "pluviometro_id", "criado_em", "data"] if c in df_chuvas.columns],
        errors="ignore",
    )

    # garante todas as colunas de saída
    for c in colunas_saida:
        if c not in df_chuvas.columns:
            df_chuvas[c] = ""

    return df_chuvas[colunas_saida]


# =============================================================================
# EXPORTAÇÃO EXCEL (DUAS ABAS) COM TABELAS
# =============================================================================
def exportar_excel_com_abas(df_lanc: pd.DataFrame, df_chuvas: pd.DataFrame, caminho_xlsx: Path):
    with pd.ExcelWriter(caminho_xlsx, engine="xlsxwriter") as writer:

        # ---------------- ABA LANÇAMENTOS ----------------
        df_lanc.to_excel(writer, sheet_name="Lançamentos", index=False)
        ws1 = writer.sheets["Lançamentos"]

        linhas, colunas = df_lanc.shape
        if colunas:
            ws1.add_table(
                0, 0,
                max(linhas, 1),
                colunas - 1,
                {
                    "name": "TB_LANCAMENTOS",
                    "columns": [{"header": c} for c in df_lanc.columns],
                    "style": "Table Style Medium 2",
                },
            )

        # ---------------- ABA CHUVAS ----------------
        df_chuvas.to_excel(writer, sheet_name="Chuvas", index=False)
        ws2 = writer.sheets["Chuvas"]

        linhas, colunas = df_chuvas.shape
        if colunas:
            ws2.add_table(
                0, 0,
                max(linhas, 1),
                colunas - 1,
                {
                    "name": "TB_CHUVAS",
                    "columns": [{"header": c} for c in df_chuvas.columns],
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

        # 2) Baixa TODAS as tabelas necessárias
        print("\n================ BAIXANDO TABELAS DO BANCO =================")

        print("-> realizado ...")
        df_realizado = pd.read_sql(text("SELECT * FROM realizado"), conn)
        print(f"   Total realizado: {len(df_realizado)}")

        print("-> chuvas ...")
        df_chuvas = pd.read_sql(text("SELECT * FROM chuvas"), conn)
        print(f"   Total chuvas..: {len(df_chuvas)}")

        print("-> fazendas ...")
        df_fazendas = pd.read_sql(text("SELECT * FROM fazendas"), conn)
        print(f"   Total fazendas: {len(df_fazendas)}")

        print("============================================================")

        # 3) Diagnóstico
        mostrar_resumo(df_realizado, "RESUMO REALIZADO")
        mostrar_resumo(df_chuvas, "RESUMO CHUVAS")

        # 4) Loop por cliente+fazenda (objeto CLIENTES)
        for cliente_chave, meta in CLIENTES.items():
            cliente_dir = EXECUTAVEL_ROOT / cliente_chave
            cliente_dir.mkdir(parents=True, exist_ok=True)

            saida = cliente_dir / "REALIZADO.xlsx"

            cid = str(meta["cliente_id"])
            fid = str(meta["fazenda_id"])

            print(f"\n---------------- PROCESSANDO {cliente_chave} ----------------")
            print(f"cliente_id : {cid}")
            print(f"fazenda_id : {fid}")

            # ---- filtros por cliente_id + fazenda_id
            if not df_realizado.empty and {"cliente_id", "fazenda_id"}.issubset(df_realizado.columns):
                df_realizado_filtrado = df_realizado[
                    (df_realizado["cliente_id"].astype(str) == cid) &
                    (df_realizado["fazenda_id"].astype(str) == fid)
                ].copy()
            else:
                df_realizado_filtrado = pd.DataFrame()

            if not df_chuvas.empty and {"cliente_id", "fazenda_id"}.issubset(df_chuvas.columns):
                df_chuvas_filtrado = df_chuvas[
                    (df_chuvas["cliente_id"].astype(str) == cid) &
                    (df_chuvas["fazenda_id"].astype(str) == fid)
                ].copy()
            else:
                df_chuvas_filtrado = pd.DataFrame()

            print(f"Registros encontrados (realizado): {len(df_realizado_filtrado)}")
            print(f"Registros encontrados (chuvas)....: {len(df_chuvas_filtrado)}")

            # ---- transforma para Excel
            df_lanc_final = transformar_dataframe_realizado(df_realizado_filtrado, cliente_chave)
            df_chuvas_final = transformar_dataframe_chuvas(df_chuvas_filtrado, cliente_chave, df_fazendas)

            # ---- exporta um único xlsx com duas abas
            exportar_excel_com_abas(df_lanc_final, df_chuvas_final, saida)

            print(f"Arquivo salvo em: {saida}")
            print("------------------------------------------------------")


if __name__ == "__main__":
    main()
