import express from 'express';
import cors from 'cors';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
import { queryDB, executeDB } from './database.js';  // Corrigido para importar a função executeDB

// Definindo o caminho do diretório
const __dirname = dirname(fileURLToPath(import.meta.url));

// Caminho do banco de dados
const dbPath = join(__dirname, '../assets/banco.db');

// Função para conectar ao banco de dados
const connectDb = () => {
    return new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('Erro ao conectar ao banco de dados:', err.message);
            return null;
        } else {
            console.log('Conectado ao banco SQLite.');
            return new sqlite3.Database(dbPath);  // Criando a conexão diretamente aqui
        }
    });
};

// Configuração do servidor
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Rotas - Pessoa
app.get('/pessoas', async (req, res) => {
    const db = connectDb();  // Conecta-se ao banco de dados
    if (!db) {
        return res.status(500).json({ error: 'Não foi possível conectar ao banco de dados.' });
    }
    try {
        const rows = await queryDB('SELECT * FROM Pessoa', [], db);
        res.json(rows);  // Retorna as pessoas em formato JSON
    } catch (err) {
        console.error('Erro ao buscar pessoas:', err.message);
        res.status(500).json({ error: err.message });
    }
});

app.post('/pessoas', async (req, res) => {
    const { nome, usuario, senha } = req.body;
    const db = connectDb();  // Conecta-se ao banco de dados
    if (!db) {
        return res.status(500).json({ error: 'Não foi possível conectar ao banco de dados.' });
    }
    const sql = 'INSERT INTO Pessoa (nome, usuario, senha) VALUES (?, ?, ?)';
    try {
        const result = await executeDB(sql, [nome, usuario, senha], db);
        res.status(201).json({ id: result.lastID });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/pessoas/:id', async (req, res) => {
    const { id } = req.params;
    const db = connectDb();  // Conecta-se ao banco de dados
    if (!db) {
        return res.status(500).json({ error: 'Não foi possível conectar ao banco de dados.' });
    }
    const sql = 'DELETE FROM Pessoa WHERE CodPessoa = ?';
    try {
        const result = await executeDB(sql, [id], db);
        res.status(200).json({ deleted: result.changes });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/pessoas/:id', async (req, res) => {
    const db = connectDb();  // Conecta-se ao banco de dados
    if (!db) {
        return res.status(500).json({ error: 'Não foi possível conectar ao banco de dados.' });
    }
    try {
        const { id } = req.params;
        const pessoa = await queryDB('SELECT * FROM Pessoa WHERE CodPessoa = ?', [id], db);
        if (pessoa.length === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        res.json(pessoa[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar usuário' });
    }
});

// Rotas - Anúncios (corrigindo a nomenclatura para plural)
app.get('/anuncios', async (req, res) => {
    const db = connectDb();  // Conecta-se ao banco de dados
    if (!db) {
        return res.status(500).json({ error: 'Não foi possível conectar ao banco de dados.' });
    }
    try {
        const rows = await queryDB('SELECT * FROM Anuncio', [], db);
        res.json(rows);  // Retorna os anúncios
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/anuncios', async (req, res) => {
    console.log('Recebido no backend:', req.body); // Loga os dados recebidos
  
    const { nome, valor, desc, ano, versao, codPessoa, linkFoto } = req.body;
  
    if (!nome || !valor || !desc || !ano || !versao || !codPessoa || !linkFoto) {
      return res.status(400).json({
        error: 'Todos os campos são obrigatórios, incluindo codPessoa e linkFoto.',
      });
    }
  
    const db = connectDb();
    if (!db) {
      return res.status(500).json({ error: 'Erro ao conectar ao banco de dados' });
    }
  
    const sql = 'INSERT INTO Anuncio (nome, valor, desc, ano, versao, CodPessoa, linkFoto) VALUES (?, ?, ?, ?, ?, ?, ?)';
    try {
      const result = await executeDB(sql, [nome, valor, desc, ano, versao, codPessoa, linkFoto], db);
      res.status(201).json({ id: result.lastID });
    } catch (err) {
      console.error('Erro ao criar anúncio:', err.message);
      res.status(500).json({ error: 'Erro ao criar anúncio: ' + err.message });
    }
  });
  

app.delete('/anuncios/:id', async (req, res) => {
    const { id } = req.params;
    const db = connectDb();  // Conecta-se ao banco de dados
    if (!db) {
        return res.status(500).json({ error: 'Não foi possível conectar ao banco de dados.' });
    }
    const sql = 'DELETE FROM Anuncio WHERE CodAnuncio = ?';
    try {
        const result = await executeDB(sql, [id], db);
        res.status(200).json({ deleted: result.changes });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/chats/:userId', async (req, res) => {
    const db = connectDb();
    if (!db) {
      return res.status(500).json({ error: 'Não foi possível conectar ao banco de dados.' });
    }
    const { userId } = req.params;
    try {
      // Consulta SQL para obter chats com mensagens associadas
      const rows = await queryDB(
        'SELECT c.codChat, c.Codpessoa1, c.Codpessoa2, m.codMensagem, m.texto, p.nome AS nomePessoa ' +
        'FROM Chat c ' +
        'LEFT JOIN Mensagem m ON m.codChat = c.codChat ' +
        'LEFT JOIN Pessoa p ON p.CodPessoa = m.codPessoa ' +
        'WHERE c.Codpessoa1 = ? OR c.Codpessoa2 = ?',
        [userId, userId],
        db
      );
  
      // Verifique a estrutura retornada
      console.log('Dados de chats e mensagens:', rows);
  
      // Agrupar chats e mensagens
      const chatsComMensagens = rows.reduce((acc, row) => {
        // Encontrar o chat já existente no array
        const chatIndex = acc.findIndex(
          (chat) => chat.codChat === row.codChat
        );
  
        // Se o chat ainda não existe, cria um novo
        if (chatIndex === -1) {
          acc.push({
            codChat: row.codChat,
            Codpessoa1: row.Codpessoa1,
            Codpessoa2: row.Codpessoa2,
            mensagens: row.codMensagem
              ? [
                  {
                    codMensagem: row.codMensagem,
                    texto: row.texto,
                    nomePessoa: row.nomePessoa
                  }
                ]
              : [],
          });
        } else {
          // Se o chat já existe, adiciona as mensagens associadas
          if (row.codMensagem) {
            acc[chatIndex].mensagens.push({
              codMensagem: row.codMensagem,
              texto: row.texto,
              nomePessoa: row.nomePessoa
            });
          }
        }
  
        return acc;
      }, []);
  
      console.log('Chats com mensagens agrupadas:', chatsComMensagens); // Verifique a estrutura final
  
      res.json(chatsComMensagens);  // Retorna os chats com mensagens associadas
    } catch (err) {
      console.error('Erro ao buscar chats:', err.message);
      res.status(500).json({ error: err.message });
    }
  });
  

app.post('/chats', async (req, res) => {
    const { CodPessoa1, CodPessoa2, mensagem } = req.body;
  
    // Verifique se os campos estão presentes
    if (!CodPessoa1 || !CodPessoa2 || !mensagem) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
    }
  
    try {
      // Lógica para inserir no banco de dados
      await db.run('INSERT INTO Chat (CodPessoa1, CodPessoa2, mensagem) VALUES (?, ?, ?)', [CodPessoa1, CodPessoa2, mensagem]);
      res.status(201).json({ message: 'Chat criado com sucesso' });
    } catch (err) {
      console.error('Erro ao criar chat:', err);
      res.status(500).json({ error: 'Erro ao criar chat' });
    }
  });

// Rota para buscar as mensagens de um chat específico
app.get('/mensagens/:chatId', async (req, res) => {
    const db = connectDb();
    if (!db) {
        return res.status(500).json({ error: 'Não foi possível conectar ao banco de dados.' });
    }
    const { chatId } = req.params;
    try {
        const rows = await queryDB('SELECT * FROM Mensagem WHERE codChat = ?', [chatId], db);
        res.json(rows);  // Retorna as mensagens do chat
    } catch (err) {
        console.error('Erro ao buscar mensagens:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Rota para criar uma nova mensagem em um chat
app.post('/mensagens', async (req, res) => {
    const { codPessoa1, codPessoa2, texto } = req.body;
    
    if (!codPessoa1 || !codPessoa2 || !texto) {
        return res.status(400).json({ error: 'Campos obrigatórios não preenchidos' });
    }

    const db = connectDb();
    if (!db) {
        return res.status(500).json({ error: 'Não foi possível conectar ao banco de dados.' });
    }

    try {
        // Verificar se já existe um chat entre os dois usuários
        let rows = await queryDB('SELECT * FROM Chat WHERE (Codpessoa1 = ? AND Codpessoa2 = ?) OR (Codpessoa1 = ? AND Codpessoa2 = ?)', 
            [codPessoa1, codPessoa2, codPessoa2, codPessoa1], db);

        let codChat;
        if (rows.length > 0) {
            // Se o chat existe, pegamos o ID
            codChat = rows[0].codChat;
        } else {
            // Se não existe, cria o chat
            const insertResult = await queryDB('INSERT INTO Chat (Codpessoa1, Codpessoa2) VALUES (?, ?)', 
                [codPessoa1, codPessoa2], db);
            codChat = insertResult.lastID;  // ID do chat recém-criado
        }

        // Agora cria a mensagem
        const query = 'INSERT INTO Mensagem (codChat, codPessoa, texto) VALUES (?, ?, ?)';
        await queryDB(query, [codChat, codPessoa1, texto], db);

        res.status(201).json({ message: 'Mensagem criada com sucesso' });
    } catch (err) {
        console.error('Erro ao criar mensagem:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Rota para deletar um chat e suas mensagens associadas
app.delete('/chats/:id', async (req, res) => {
    const { id } = req.params;
    const db = connectDb();
    if (!db) {
        return res.status(500).json({ error: 'Não foi possível conectar ao banco de dados.' });
    }
    try {
        // Primeiro, deletamos as mensagens do chat
        await executeDB('DELETE FROM Mensagem WHERE codChat = ?', [id], db);
        // Agora, deletamos o chat
        const result = await executeDB('DELETE FROM Chat WHERE codChat = ?', [id], db);
        res.status(200).json({ deleted: result.changes });
    } catch (err) {
        console.error('Erro ao deletar chat:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Inicialização do servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
