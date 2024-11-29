import sqlite3
import os

# Obtém o diretório onde o script Python está sendo executado
diretorio_base = os.path.dirname(os.path.abspath(__file__))  # Caminho completo até o diretório atual

# Caminho para a pasta 'assets' que está em 'D:\AdsBra\MarketPlaceAuto\src\assets'
pasta_assets = os.path.join(diretorio_base, '..', 'assets')  # Caminho relativo para a pasta assets
if not os.path.exists(pasta_assets):
    os.makedirs(pasta_assets)  # Cria a pasta 'assets' se não existir

# Caminho completo para o banco de dados na pasta 'assets'
caminho_banco = os.path.join(pasta_assets, 'banco.db')

def criar_banco():
    # Conectar ao banco de dados (irá criar o arquivo banco.db na pasta assets)
    conn = sqlite3.connect(caminho_banco)
    cursor = conn.cursor()

    # Criar a tabela Pessoa
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS Pessoa (
            CodPessoa INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            usuario TEXT NOT NULL UNIQUE,
            senha TEXT NOT NULL
        )
    ''')

    # Criar a tabela Chat
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS Chat (
            codChat INTEGER PRIMARY KEY AUTOINCREMENT,
            Codpessoa1 INTEGER NOT NULL,
            Codpessoa2 INTEGER NOT NULL
        )
    ''')

    # Criar a tabela Mensagem
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS Mensagem (
            codMensagem INTEGER PRIMARY KEY AUTOINCREMENT,
            codChat INTEGER NOT NULL,
            codPessoa INTEGER NOT NULL,
            texto TEXT NOT NULL
        )
    ''')

    # Criar a tabela Anuncio (adicionando o campo linkFoto)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS Anuncio (
            CodAnuncio INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            valor REAL NOT NULL,
            desc TEXT,
            ano INTEGER NOT NULL,
            versao TEXT NOT NULL,
            CodPessoa INTEGER NOT NULL,
            linkFoto TEXT
        )
    ''')

    # Fechar a conexão
    conn.commit()
    conn.close()

if __name__ == '__main__':
    criar_banco()
    print(f"Banco de dados criado com sucesso em {caminho_banco}!")
