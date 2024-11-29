import sqlite3
import os

# Obtém o diretório onde o script Python está sendo executado
diretorio_base = os.path.dirname(os.path.abspath(__file__))  # Caminho completo até o diretório atual

# Caminho para a pasta 'assets' que está em 'D:\AdsBra\MarketPlaceAuto\src\assets'
pasta_assets = os.path.join(diretorio_base, '..', 'assets')  # Caminho relativo para a pasta assets

# Caminho completo para o banco de dados na pasta 'assets'
caminho_banco = os.path.join(pasta_assets, 'banco.db')

# Função para conectar ao banco de dados
def conectar():
    return sqlite3.connect(caminho_banco)

# Funções auxiliares para entradas validadas
def input_float(prompt):
    while True:
        try:
            return float(input(prompt))
        except ValueError:
            print("Entrada inválida! Digite um número válido.")

def input_int(prompt):
    while True:
        try:
            return int(input(prompt))
        except ValueError:
            print("Entrada inválida! Digite um número inteiro válido.")

# Funções CRUD para a tabela Pessoa

def criar_pessoa(nome, usuario, senha):
    conn = conectar()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO Pessoa (nome, usuario, senha) 
        VALUES (?, ?, ?)
    ''', (nome, usuario, senha))
    conn.commit()
    conn.close()

def ler_pessoa(codPessoa):
    conn = conectar()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT * FROM Pessoa WHERE CodPessoa = ?
    ''', (codPessoa,))
    pessoa = cursor.fetchone()
    conn.close()
    return pessoa

def atualizar_pessoa(codPessoa, nome=None, usuario=None, senha=None):
    conn = conectar()
    cursor = conn.cursor()
    if nome:
        cursor.execute('UPDATE Pessoa SET nome = ? WHERE CodPessoa = ?', (nome, codPessoa))
    if usuario:
        cursor.execute('UPDATE Pessoa SET usuario = ? WHERE CodPessoa = ?', (usuario, codPessoa))
    if senha:
        cursor.execute('UPDATE Pessoa SET senha = ? WHERE CodPessoa = ?', (senha, codPessoa))
    conn.commit()
    conn.close()

def deletar_pessoa(codPessoa):
    conn = conectar()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM Pessoa WHERE CodPessoa = ?', (codPessoa,))
    conn.commit()
    conn.close()

def listar_pessoas():
    conn = conectar()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM Pessoa')
    pessoas = cursor.fetchall()
    conn.close()
    return pessoas

# Funções CRUD para a tabela Chat

def criar_chat(codpessoa1, codpessoa2):
    conn = conectar()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO Chat (Codpessoa1, Codpessoa2) 
        VALUES (?, ?)
    ''', (codpessoa1, codpessoa2))
    conn.commit()
    conn.close()

def ler_chat(codChat):
    conn = conectar()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT * FROM Chat WHERE codChat = ?
    ''', (codChat,))
    chat = cursor.fetchone()
    conn.close()
    return chat

def deletar_chat(codChat):
    conn = conectar()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM Chat WHERE codChat = ?', (codChat,))
    conn.commit()
    conn.close()

def listar_chats():
    conn = conectar()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM Chat')
    chats = cursor.fetchall()
    conn.close()
    return chats

# Funções CRUD para a tabela Mensagem

def criar_mensagem(codChat, codPessoa, texto):
    conn = conectar()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO Mensagem (codChat, codPessoa, texto) 
        VALUES (?, ?, ?)
    ''', (codChat, codPessoa, texto))
    conn.commit()
    conn.close()

def ler_mensagem(codMensagem):
    conn = conectar()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT * FROM Mensagem WHERE codMensagem = ?
    ''', (codMensagem,))
    mensagem = cursor.fetchone()
    conn.close()
    return mensagem

def deletar_mensagem(codMensagem):
    conn = conectar()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM Mensagem WHERE codMensagem = ?', (codMensagem,))
    conn.commit()
    conn.close()

def listar_mensagens():
    conn = conectar()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM Mensagem')
    mensagens = cursor.fetchall()
    conn.close()
    return mensagens

# Funções CRUD para a tabela Anuncio (com linkFoto)

def criar_anuncio(nome, valor, desc, ano, versao, CodPessoa, linkFoto):
    conn = conectar()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO Anuncio (nome, valor, desc, ano, versao, CodPessoa, linkFoto) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (nome, valor, desc, ano, versao, CodPessoa, linkFoto))
    conn.commit()
    conn.close()

def ler_anuncio(CodAnuncio):
    conn = conectar()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT * FROM Anuncio WHERE CodAnuncio = ?
    ''', (CodAnuncio,))
    anuncio = cursor.fetchone()
    conn.close()
    return anuncio

def atualizar_anuncio(CodAnuncio, nome=None, valor=None, desc=None, ano=None, versao=None, linkFoto=None):
    conn = conectar()
    cursor = conn.cursor()
    if nome:
        cursor.execute('UPDATE Anuncio SET nome = ? WHERE CodAnuncio = ?', (nome, CodAnuncio))
    if valor is not None:
        cursor.execute('UPDATE Anuncio SET valor = ? WHERE CodAnuncio = ?', (valor, CodAnuncio))
    if desc:
        cursor.execute('UPDATE Anuncio SET desc = ? WHERE CodAnuncio = ?', (desc, CodAnuncio))
    if ano:
        cursor.execute('UPDATE Anuncio SET ano = ? WHERE CodAnuncio = ?', (ano, CodAnuncio))
    if versao:
        cursor.execute('UPDATE Anuncio SET versao = ? WHERE CodAnuncio = ?', (versao, CodAnuncio))
    if linkFoto:
        cursor.execute('UPDATE Anuncio SET linkFoto = ? WHERE CodAnuncio = ?', (linkFoto, CodAnuncio))
    conn.commit()
    conn.close()

def deletar_anuncio(CodAnuncio):
    conn = conectar()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM Anuncio WHERE CodAnuncio = ?', (CodAnuncio,))
    conn.commit()
    conn.close()

def listar_anuncios():
    conn = conectar()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM Anuncio')
    anuncios = cursor.fetchall()
    conn.close()
    return anuncios

# Função para mostrar o menu interativo

def menu():
    while True:
        print("\n--- MENU PRINCIPAL ---")
        print("1. Gerenciar Tabela Pessoa")
        print("2. Gerenciar Tabela Chat")
        print("3. Gerenciar Tabela Mensagem")
        print("4. Gerenciar Tabela Anuncio")
        print("5. Sair")
        
        opcao = input("Escolha uma opção (1-5): ")
        
        if opcao == "1":
            menu_pessoa()
        elif opcao == "2":
            menu_chat()
        elif opcao == "3":
            menu_mensagem()
        elif opcao == "4":
            menu_anuncio()
        elif opcao == "5":
            print("Saindo...")
            break
        else:
            print("Opção inválida! Tente novamente.")

# Funções para o menu de gerenciamento da tabela Anuncio

def menu_pessoa():
    while True:
        print("\n--- Gerenciar Pessoa ---")
        print("1. Criar Pessoa")
        print("2. Ler Pessoa")
        print("3. Listar Pessoas")
        print("4. Atualizar Pessoa")
        print("5. Deletar Pessoa")
        print("6. Voltar")
        
        opcao = input("Escolha uma opção (1-6): ")
        
        if opcao == "1":
            nome = input("Nome da Pessoa: ")
            usuario = input("Usuário: ")
            senha = input("Senha: ")
            criar_pessoa(nome, usuario, senha)
            print("Pessoa criada com sucesso!")
        elif opcao == "2":
            codPessoa = input_int("Código da Pessoa: ")
            pessoa = ler_pessoa(codPessoa)
            if pessoa:
                print(f"Pessoa: {pessoa}")
            else:
                print("Pessoa não encontrada.")
        elif opcao == "3":
            pessoas = listar_pessoas()
            if pessoas:
                for p in pessoas:
                    print(p)
            else:
                print("Nenhuma pessoa cadastrada.")
        elif opcao == "4":
            codPessoa = input_int("Código da Pessoa: ")
            nome = input("Novo Nome (deixe em branco para não alterar): ")
            usuario = input("Novo Usuário (deixe em branco para não alterar): ")
            senha = input("Nova Senha (deixe em branco para não alterar): ")
            atualizar_pessoa(codPessoa, nome or None, usuario or None, senha or None)
            print("Pessoa atualizada com sucesso!")
        elif opcao == "5":
            codPessoa = input_int("Código da Pessoa: ")
            deletar_pessoa(codPessoa)
            print("Pessoa deletada com sucesso!")
        elif opcao == "6":
            break
        else:
            print("Opção inválida! Tente novamente.")

def menu_chat():
    while True:
        print("\n--- Gerenciar Chat ---")
        print("1. Criar Chat")
        print("2. Ler Chat")
        print("3. Listar Chats")
        print("4. Deletar Chat")
        print("5. Voltar")
        
        opcao = input("Escolha uma opção (1-5): ")
        
        if opcao == "1":
            codpessoa1 = input_int("Código da Pessoa 1: ")
            codpessoa2 = input_int("Código da Pessoa 2: ")
            criar_chat(codpessoa1, codpessoa2)
            print("Chat criado com sucesso!")
        elif opcao == "2":
            codChat = input_int("Código do Chat: ")
            chat = ler_chat(codChat)
            if chat:
                print(f"Chat: {chat}")
            else:
                print("Chat não encontrado.")
        elif opcao == "3":
            chats = listar_chats()
            if chats:
                for c in chats:
                    print(c)
            else:
                print("Nenhum chat cadastrado.")
        elif opcao == "4":
            codChat = input_int("Código do Chat: ")
            deletar_chat(codChat)
            print("Chat deletado com sucesso!")
        elif opcao == "5":
            break
        else:
            print("Opção inválida! Tente novamente.")


def menu_mensagem():
    while True:
        print("\n--- Gerenciar Mensagem ---")
        print("1. Criar Mensagem")
        print("2. Ler Mensagem")
        print("3. Listar Mensagens")
        print("4. Deletar Mensagem")
        print("5. Voltar")
        
        opcao = input("Escolha uma opção (1-5): ")
        
        if opcao == "1":
            codChat = input_int("Código do Chat: ")
            codPessoa = input_int("Código da Pessoa: ")
            texto = input("Texto da Mensagem: ")
            criar_mensagem(codChat, codPessoa, texto)
            print("Mensagem criada com sucesso!")
        elif opcao == "2":
            codMensagem = input_int("Código da Mensagem: ")
            mensagem = ler_mensagem(codMensagem)
            if mensagem:
                print(f"Mensagem: {mensagem}")
            else:
                print("Mensagem não encontrada.")
        elif opcao == "3":
            mensagens = listar_mensagens()
            if mensagens:
                for m in mensagens:
                    print(m)
            else:
                print("Nenhuma mensagem cadastrada.")
        elif opcao == "4":
            codMensagem = input_int("Código da Mensagem: ")
            deletar_mensagem(codMensagem)
            print("Mensagem deletada com sucesso!")
        elif opcao == "5":
            break
        else:
            print("Opção inválida! Tente novamente.")

def menu_anuncio():
    while True:
        print("\n--- Gerenciar Anúncio ---")
        print("1. Criar Anúncio")
        print("2. Ler Anúncio")
        print("3. Listar Anúncios")
        print("4. Atualizar Anúncio")
        print("5. Deletar Anúncio")
        print("6. Voltar")
        
        opcao = input("Escolha uma opção (1-6): ")
        
        if opcao == "1":
            nome = input("Nome do Anúncio: ")
            valor = input_float("Valor do Anúncio: ")
            desc = input("Descrição do Anúncio: ")
            ano = input_int("Ano: ")
            versao = input("Versão: ")
            CodPessoa = input_int("Código do Anunciante (Pessoa): ")
            linkFoto = input("Link da Foto: ")
            criar_anuncio(nome, valor, desc, ano, versao, CodPessoa, linkFoto)
            print("Anúncio criado com sucesso!")
        elif opcao == "2":
            CodAnuncio = input_int("Código do Anúncio: ")
            anuncio = ler_anuncio(CodAnuncio)
            if anuncio:
                print(f"Anúncio: {anuncio}")
            else:
                print("Anúncio não encontrado.")
        elif opcao == "3":
            anuncios = listar_anuncios()
            if anuncios:
                for a in anuncios:
                    print(a)
            else:
                print("Nenhum anúncio cadastrado.")
        elif opcao == "4":
            CodAnuncio = input_int("Código do Anúncio: ")
            nome = input("Novo Nome (deixe em branco para não alterar): ")
            valor = input("Novo Valor (deixe em branco para não alterar): ")
            desc = input("Nova Descrição (deixe em branco para não alterar): ")
            ano = input("Novo Ano (deixe em branco para não alterar): ")
            versao = input("Nova Versão (deixe em branco para não alterar): ")
            linkFoto = input("Novo Link da Foto (deixe em branco para não alterar): ")
            atualizar_anuncio(CodAnuncio, nome or None, float(valor) if valor else None, 
                              desc or None, int(ano) if ano else None, versao or None, linkFoto or None)
            print("Anúncio atualizado com sucesso!")
        elif opcao == "5":
            CodAnuncio = input_int("Código do Anúncio: ")
            deletar_anuncio(CodAnuncio)
            print("Anúncio deletado com sucesso!")
        elif opcao == "6":
            break
        else:
            print("Opção inválida! Tente novamente.")



# Rodar o menu principal
if __name__ == '__main__':
    menu()
