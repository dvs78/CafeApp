# gerar_backup_lancamentos.py
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

# Pasta do executável (arquivo fixo REALIZADO.xlsx)
EXECUTAVEL_DIR = Path(
    os.getenv(
        "EXECUTAVEL_DIR",
        r"G:\Meu Drive\Python\Fazendas\Executavel\Agrocoffee"
    )
)
EXECUTAVEL_DIR.mkdir(parents=True, exist_ok=True)

SQLA_URL = (
    f"postgresql+psycopg2://{USER}:{quote_plus(PASSWORD)}"
    f"@{HOST}:{PORT}/{DBNAME}"
)

# Nome do cliente = nome da pasta onde está este arquivo .py
CLIENTE_NOME = Path(__file__).resolve().parent.name

# ============================================================================

def transformar_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """
    Transforma a tabela 'realizado' conforme solicitado:
    - renomeia colunas (safra→safras, lavoura→lavouras, etc.)
    - cria colunas ano, mes, dia
    - define 'clientes' = 'Agrocoffee'
    - exclui colunas indesejadas
    - formata data como dd/mm/YYYY
    - coloca todas as colunas em MAIÚSCULO, exceto 'Qtde TOTAL' e 'Ok'
    - padroniza valores da coluna Ok (realizado→Ok, cancelado→Cancelado)
    - reordena as colunas na sequência pedida
    """

    # 1) Converter a coluna data para datetime e criar ano/mes/dia
    if "data" in df.columns:
        df["data"] = pd.to_datetime(df["data"], errors="coerce")
        df["ano"] = df["data"].dt.year
        df["mes"] = df["data"].dt.month
        df["dia"] = df["data"].dt.day

    # 2) Coluna clientes = Agrocoffee
    df["clientes"] = "Agrocoffee"

    # 3) Renomear colunas
    rename_map = {
        "safra": "safras",
        "lavoura": "lavouras",
        "servico": "serviços",
        "produto": "produtos",
        "unidade": "uni",
        "quantidade": "Qtde TOTAL",
        "status": "Ok",   # renomeia coluna status para Ok
    }
    df = df.rename(columns=rename_map)

    # 4) Padronizar valores da coluna Ok
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

    # 5) Remover colunas desnecessárias
    cols_drop = ["id", "usuario_id", "cliente_id", "criado_em"]
    df = df.drop(columns=[c for c in cols_drop if c in df.columns], errors="ignore")

    # 6) Formatar a coluna data para dd/mm/YYYY
    if "data" in df.columns:
        df["data"] = df["data"].dt.strftime("%d/%m/%Y")

    # 7) Colocar colunas em MAIÚSCULO, exceto Ok e Qtde TOTAL
    excecoes = {"Ok", "Qtde TOTAL"}
    novas_colunas = []
    for col in df.columns:
        if col in excecoes:
            novas_colunas.append(col)
        else:
            novas_colunas.append(col.upper())
    df.columns = novas_colunas

    # 7.1) Renomear MES → MÊS (depois de deixar maiúsculo)
    if "MES" in df.columns:
        df = df.rename(columns={"MES": "MÊS"})

    # 8) Reordenar colunas na sequência pedida
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

    df = df[cols_exist + restantes]

    return df


def gerar_backup_lancamentos():
    """
    Cria/atualiza REALIZADO.xlsx em EXECUTAVEL_DIR
    contendo APENAS a tabela 'realizado' como aba 'Lançamentos',
    com todas as transformações pedidas.
    """
    xlsx_exec = EXECUTAVEL_DIR / "REALIZADO.xlsx"
    agora = dt.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    print(f"🔄 Gerando REALIZADO.xlsx em: {xlsx_exec}")
    print(f"   Data/hora de geração: {agora}")
    print(f"   Cliente (nome da pasta): {CLIENTE_NOME}")

    engine = create_engine(
        SQLA_URL,
        connect_args={"sslmode": "require"},
        pool_pre_ping=True,
    )

    with engine.connect() as conn:
        # Garante que a tabela existe
        tem_realizado = conn.execute(
            text(
                """
                SELECT EXISTS (
                    SELECT 1
                    FROM information_schema.tables
                    WHERE table_schema = 'public'
                      AND table_name = 'realizado'
                )
                """
            )
        ).scalar()

        if not tem_realizado:
            raise RuntimeError("Tabela 'realizado' não encontrada no schema 'public'.")

        # Carrega somente a tabela realizado
        df = pd.read_sql(text('SELECT * FROM "realizado"'), conn)
        print(f"   • realizado (original) → {len(df)} linha(s)")

    # Aplica as transformações
    df = transformar_dataframe(df)
    print(f"   • Lançamentos (transformado) → {len(df)} linha(s)")

    # Cria o Excel com UMA única aba: Lançamentos
    with pd.ExcelWriter(xlsx_exec) as writer:
        df.to_excel(writer, sheet_name="Lançamentos", index=False)

    print("✅ Arquivo REALIZADO.xlsx criado/atualizado com sucesso.")


def main():
    try:
        gerar_backup_lancamentos()
    except Exception as e:
        print("❌ Erro ao gerar REALIZADO:", e)


if __name__ == "__main__":
    main()
