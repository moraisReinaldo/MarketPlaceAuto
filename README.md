# 🚗 CarBuy

## 🚀 Visão Geral do Projeto

O CarBuy é uma plataforma online inovadora, projetada para simplificar e otimizar a compra e venda de veículos diretamente entre usuários. Desenvolvido com uma arquitetura robusta e moderna, utilizando **React** para o frontend, **Node.js** com **Express** para o backend e **MySQL** como sistema de gerenciamento de banco de dados relacional, o projeto visa proporcionar uma experiência de negociação transparente, eficiente e justa.

Nossa missão é conectar compradores e vendedores de automóveis de forma direta, eliminando intermediários desnecessários e garantindo que todas as ferramentas essenciais para uma transação bem-sucedida estejam ao alcance de suas mãos. Com foco na usabilidade e segurança, o CarBuy oferece um ambiente confiável para que entusiastas de carros e vendedores possam interagir e fechar negócios com confiança.




## 🛠 Tecnologias Utilizadas

O CarBuy foi construído com as seguintes tecnologias:

-   **Frontend**: React.js
    -   Uma biblioteca JavaScript para construção de interfaces de usuário interativas e reativas.
-   **Backend**: Node.js com Express
    -   Node.js é um ambiente de tempo de execução JavaScript assíncrono e orientado a eventos, ideal para construir aplicações de rede escaláveis.
    -   Express é um framework web minimalista e flexível para Node.js, que fornece um conjunto robusto de recursos para desenvolver aplicações web e APIs.
-   **Banco de Dados**: MySQL
    -   Um sistema de gerenciamento de banco de dados relacional de código aberto, amplamente utilizado para aplicações web devido à sua robustez e escalabilidade.




## 📦 Funcionalidades Principais

O CarBuy oferece um conjunto abrangente de funcionalidades projetadas para otimizar a experiência de compra e venda de veículos:

-   **Visualização de Catálogo de Veículos**: Uma interface intuitiva para navegar por uma vasta gama de veículos disponíveis, com imagens de alta qualidade e informações essenciais.
-   **Sistema de Busca e Filtros Avançados**: Ferramentas de busca poderosas que permitem aos usuários refinar suas pesquisas por marca, modelo, ano, preço, localização e outras características relevantes, facilitando a localização do veículo ideal.
-   **Autenticação de Usuários com Criptografia**: Um sistema de autenticação seguro que protege as informações dos usuários através de criptografia robusta, garantindo a privacidade e a integridade dos dados.
-   **Sistema de Mensagens Integrado**: Uma funcionalidade de chat dentro da própria plataforma, permitindo que compradores e vendedores se comuniquem diretamente e negociem de forma eficiente e segura.
-   **Integração com Banco de Dados Relacional**: A utilização do MySQL garante a organização, consistência e recuperação eficiente dos dados, suportando a complexidade das informações de veículos e usuários.


## ⚙️ Como Rodar o Projeto Localmente

Para configurar e executar o projeto CarBuy em sua máquina local, siga os passos abaixo:

### Pré-requisitos

Certifique-se de ter as seguintes ferramentas instaladas em seu ambiente:

-   [Node.js](https://nodejs.org/en/download/) (versão 14 ou superior)
-   [npm](https://www.npmjs.com/get-npm) (gerenciador de pacotes do Node.js)
-   [MySQL Server](https://dev.mysql.com/downloads/mysql/) (versão 8.0 ou superior)
-   [MySQL Workbench](https://www.mysql.com/products/workbench/) ou outro cliente MySQL de sua preferência para gerenciar o banco de dados.
-   [Git](https://git-scm.com/downloads) para clonar o repositório.

### 1. Clonar o Repositório

Abra seu terminal ou prompt de comando e execute o seguinte comando para clonar o repositório do CarBuy:

```bash
git clone https://github.com/seu-usuario/carbuy.git
cd carbuy
```

### 2. Configuração do Banco de Dados

O script para criação das tabelas do banco de dados está localizado no arquivo `BancoSql.txt` na raiz do projeto. Siga os passos:

1.  Abra seu cliente MySQL (ex: MySQL Workbench).
2.  Conecte-se ao seu servidor MySQL.
3.  Crie um novo banco de dados para o projeto CarBuy (ex: `carbuy_db`).
4.  Execute o conteúdo do arquivo `BancoSql.txt` neste novo banco de dados para criar as tabelas necessárias.

**Importante**: Você pode precisar ajustar as configurações de conexão com o banco de dados nos arquivos `src/BackEndJs/server.js` e `src/BackEndJs/database.js` (usuário, senha, porta, nome do banco de dados) para corresponder às suas configurações locais do MySQL.

### 3. Instalar Dependências e Iniciar o Backend

Navegue até a pasta do projeto no terminal e, em um terminal separado (ou aba), inicie o backend:

```bash
# Certifique-se de estar na raiz do projeto 'carbuy'
cd src/BackEndJs
npm install
node server.js
```

Este comando instalará as dependências do backend e iniciará o servidor Node.js, estabelecendo a conexão com o banco de dados.

### 4. Instalar Dependências e Iniciar o Frontend

Em um **novo terminal** (ou aba), navegue até a pasta do frontend e inicie a aplicação React:

```bash
# Certifique-se de estar na raiz do projeto 'carbuy'
cd src/FrontEndReact
npm install
npm run dev
```

Este comando instalará as dependências do frontend e iniciará o servidor de desenvolvimento do React. A aplicação estará acessível em seu navegador, geralmente em `http://localhost:3000` ou uma porta similar.


## 🤝 Contribuição

Contribuições são sempre bem-vindas! Se você deseja contribuir com o projeto CarBuy, por favor, siga estas diretrizes:

1.  **Fork** o repositório.
2.  Crie uma nova **branch** para sua feature (`git checkout -b feature/MinhaNovaFeature`).
3.  Faça suas alterações e **commit** (`git commit -m 'feat: Adiciona MinhaNovaFeature'`).
4.  Envie para o **repositório original** (`git push origin feature/MinhaNovaFeature`).
5.  Abra um **Pull Request** detalhando suas alterações.

Por favor, certifique-se de que seu código siga as boas práticas e que todos os testes passem.


## 📄 Licença

Este projeto está licenciado sob a licença MIT. Consulte o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Autor

**Reinaldo Morais**

-   [GitHub](https://github.com/ReinaldoMorais)
-   [LinkedIn](https://www.linkedin.com/in/reinaldo-henrique-morais-a9b019240/)



