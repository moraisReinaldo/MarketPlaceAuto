import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import mysql from 'mysql2/promise';

// Configuração do servidor
const app = express();
const PORT = 3001;
const saltRounds = 10; // Fator de custo para o bcrypt

const db = mysql.createPool({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'Reinaldohm1207$',
    database: 'MarketplaceAuto',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const queryDB = async (sql, params = []) => {
    let conn;
    try {
        conn = await db.getConnection();
        const [rows] = await conn.execute(sql, params);
        return rows;
    } catch (err) {
        console.error(`Erro na consulta SQL: ${sql}`, params, err);
        throw new Error(`Erro ao realizar consulta: ${err.message}`);
    } finally {
        if (conn) conn.release();
    }
};

const executeDB = async (sql, params = []) => {
    let conn;
    try {
        conn = await db.getConnection();
        const [result] = await conn.execute(sql, params);
        return result; 
    } catch (err) {
        console.error(`Erro ao executar operação SQL: ${sql}`, params, err);
        throw new Error(`Erro ao executar operação: ${err.message}`);
    } finally {
        if (conn) conn.release();
    }
};


app.use(cors());
app.use(express.json());

// --- Rotas Pessoa ---

// GET /pessoas (Listar todas as pessoas - geralmente não recomendado para produção)
app.get('/pessoas', async (req, res) => {
    try {
        const rows = await queryDB('SELECT CodPessoa, nome, usuario FROM Pessoa');
        res.json(rows);
    } catch (err) {
        console.error('Erro ao buscar pessoas:', err.message);
        res.status(500).json({ error: 'Erro interno ao buscar pessoas.' });
    }
});

// GET /pessoas/:id (Buscar pessoa por ID)
app.get('/pessoas/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const rows = await queryDB('SELECT CodPessoa, nome, usuario FROM Pessoa WHERE CodPessoa = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error('Erro ao buscar pessoa:', err.message);
        res.status(500).json({ error: 'Erro interno ao buscar pessoa.' });
    }
});

// POST /pessoas (Registrar nova pessoa)
app.post('/pessoas', async (req, res) => {
    const { nome, usuario, senha } = req.body;

    if (!nome || !usuario || !senha) {
        return res.status(400).json({ error: 'Nome, usuário e senha são obrigatórios.' });
    }

    try {
        // Verificar se usuário já existe
        const existingUser = await queryDB('SELECT CodPessoa FROM Pessoa WHERE usuario = ?', [usuario]);
        if (existingUser.length > 0) {
            return res.status(409).json({ error: 'Usuário já cadastrado.' });
        }

        // Criptografar senha
        const hashedSenha = await bcrypt.hash(senha, saltRounds);

        // Inserir no banco
        const sql = 'INSERT INTO Pessoa (nome, usuario, senha) VALUES (?, ?, ?)';
        const result = await executeDB(sql, [nome, usuario, hashedSenha]);
        res.status(201).json({ id: result.insertId, nome: nome, usuario: usuario }); // Retorna o ID e dados básicos

    } catch (err) {
        console.error('Erro ao registrar pessoa:', err.message);
        res.status(500).json({ error: 'Erro interno ao registrar pessoa.' });
    }
});

// POST /login (Autenticar usuário)
app.post('/login', async (req, res) => {
    const { usuario, senha } = req.body;

    if (!usuario || !senha) {
        return res.status(400).json({ error: 'Usuário e senha são obrigatórios.' });
    }

    try {
        const sql = 'SELECT CodPessoa, nome, usuario, senha FROM Pessoa WHERE usuario = ?';
        const users = await queryDB(sql, [usuario]);

        if (users.length === 0) {
            return res.status(401).json({ error: 'Usuário ou senha inválidos.' }); // Usuário não encontrado
        }

        const user = users[0];

        // Comparar senha fornecida com a senha hashada no banco
        const match = await bcrypt.compare(senha, user.senha);

        if (!match) {
            return res.status(401).json({ error: 'Usuário ou senha inválidos.' }); // Senha incorreta
        }

        // Login bem-sucedido
        res.status(200).json({ 
            message: 'Login bem-sucedido!', 
            user: { 
                id: user.CodPessoa, 
                nome: user.nome, 
                usuario: user.usuario 
            } 
        });

    } catch (err) {
        console.error('Erro no login:', err.message);
        res.status(500).json({ error: 'Erro interno durante o login.' });
    }
});

// DELETE /pessoas/:id (Deletar pessoa e dados associados)
app.delete('/pessoas/:id', async (req, res) => {
    const { id } = req.params;
    let connection;
    try {
        console.log(`DEBUG: Tentando obter conexão para deletar pessoa ${id}. Type of db.getConnection: ${typeof db?.getConnection}`);
        connection = await db.getConnection(); // Obter conexão do pool
        await connection.beginTransaction();

        // 1. Encontrar anúncios da pessoa
        const [anuncios] = await connection.execute('SELECT CodAnuncio FROM Anuncio WHERE CodPessoa = ?', [id]);
        const anuncioIds = anuncios.map(a => a.CodAnuncio);

        // 2. Deletar fotos dos anúncios (se houver anúncios)
        if (anuncioIds.length > 0) {
            const deleteFotosSql = `DELETE FROM FotoAnuncio WHERE CodAnuncio IN (${anuncioIds.map(() => '?').join(',')})`;
            await connection.execute(deleteFotosSql, anuncioIds);
        }

        // 3. Deletar anúncios da pessoa
        await connection.execute('DELETE FROM Anuncio WHERE CodPessoa = ?', [id]);

        // 4. Encontrar chats da pessoa
        const [chats] = await connection.execute('SELECT codChat FROM Chat WHERE Codpessoa1 = ? OR Codpessoa2 = ?', [id, id]);
        const chatIds = chats.map(c => c.codChat);

        // 5. Deletar mensagens dos chats (se houver chats)
        if (chatIds.length > 0) {
            const deleteMsgsSql = `DELETE FROM Mensagem WHERE codChat IN (${chatIds.map(() => '?').join(',')})`;
            await connection.execute(deleteMsgsSql, chatIds);
        }

        // 6. Deletar chats da pessoa
        await connection.execute('DELETE FROM Chat WHERE Codpessoa1 = ? OR Codpessoa2 = ?', [id, id]);

        // 7. Deletar a pessoa
        const [deletePessoaResult] = await connection.execute('DELETE FROM Pessoa WHERE CodPessoa = ?', [id]);

        await connection.commit();

        if (deletePessoaResult.affectedRows > 0) {
            res.status(200).json({ message: 'Usuário e todos os dados associados foram deletados com sucesso.' });
        } else {
            res.status(404).json({ message: 'Usuário não encontrado.' });
        }

    } catch (err) {
        if (connection) await connection.rollback();
        console.error('Erro ao deletar usuário:', err.message);
        res.status(500).json({ error: 'Erro interno ao deletar usuário.' });
    } finally {
        if (connection) connection.release(); // Liberar conexão de volta ao pool
    }
});

// --- Rotas Modelo ---
app.get('/modelos', async (req, res) => {
    try {
        const rows = await queryDB('SELECT * FROM Modelo ORDER BY nome');
        res.json(rows);
    } catch (err) {
        console.error('Erro ao buscar modelos:', err.message);
        res.status(500).json({ error: 'Erro interno ao buscar modelos.' });
    }
});

// --- Rotas Versao ---
app.get('/versoes/:codModelo', async (req, res) => {
    const { codModelo } = req.params;
    try {
        const rows = await queryDB('SELECT * FROM Versao WHERE CodModelo = ? ORDER BY nome, ano DESC', [codModelo]);
        res.json(rows);
    } catch (err) {
        console.error('Erro ao buscar versões:', err.message);
        res.status(500).json({ error: 'Erro interno ao buscar versões.' });
    }
});

// --- Rotas Anuncio ---

// GET /anuncios (Listar anúncios com filtros)
app.get('/anuncios', async (req, res) => {
    try {
        const { modelo, versao, ano, precoMin, precoMax } = req.query;
        let sql = `
            SELECT 
                a.CodAnuncio, a.valor, a.descricao, 
                p.CodPessoa, p.nome as nomeVendedor,
                v.CodVersao, v.nome as nomeVersao, v.ano,
                m.CodModelo, m.nome as nomeModelo
            FROM Anuncio a
            JOIN Pessoa p ON a.CodPessoa = p.CodPessoa
            JOIN Versao v ON a.CodVersao = v.CodVersao
            JOIN Modelo m ON v.CodModelo = m.CodModelo
        `;
        const params = [];
        const conditions = [];

        if (modelo) {
            conditions.push('m.CodModelo = ?');
            params.push(modelo);
        }
        if (versao) {
            conditions.push('v.CodVersao = ?');
            params.push(versao);
        }
        if (ano) {
            conditions.push('v.ano = ?');
            params.push(ano);
        }
        if (precoMin) {
            conditions.push('a.valor >= ?');
            params.push(precoMin);
        }
        if (precoMax) {
            conditions.push('a.valor <= ?');
            params.push(precoMax);
        }

        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }

        sql += ' ORDER BY a.CodAnuncio DESC';

        const anuncios = await queryDB(sql, params);

        // Buscar fotos para cada anúncio
        for (const anuncio of anuncios) {
            const fotos = await queryDB('SELECT CodFoto, linkFoto FROM FotoAnuncio WHERE CodAnuncio = ?', [anuncio.CodAnuncio]);
            anuncio.fotos = fotos;
        }

        res.json(anuncios);
    } catch (err) {
        console.error('Erro ao buscar anúncios:', err.message);
        res.status(500).json({ error: 'Erro interno ao buscar anúncios.' });
    }
});

// POST /anuncios (Criar novo anúncio)
app.post('/anuncios', async (req, res) => {
    const { valor, descricao, codPessoa, codVersao, fotos } = req.body;

    if (!valor || !codPessoa || !codVersao || !fotos || !Array.isArray(fotos) || fotos.length === 0) {
        return res.status(400).json({ error: 'Campos valor, codPessoa, codVersao e pelo menos uma foto são obrigatórios.' });
    }

    let connection;
    try {
        console.log(`DEBUG: Tentando obter conexão para criar anúncio. Type of db.getConnection: ${typeof db?.getConnection}`);
        connection = await db.getConnection(); // Obter conexão do pool
        await connection.beginTransaction();

        const anuncioSql = 'INSERT INTO Anuncio (valor, descricao, CodPessoa, CodVersao) VALUES (?, ?, ?, ?)';
        const [anuncioResult] = await connection.execute(anuncioSql, [valor, descricao || null, codPessoa, codVersao]);
        const codAnuncio = anuncioResult.insertId;

        const fotoSql = 'INSERT INTO FotoAnuncio (CodAnuncio, linkFoto) VALUES (?, ?)';
        for (const linkFoto of fotos) {
            if (linkFoto && typeof linkFoto === 'string' && linkFoto.trim() !== '') { // Validação extra
                 await connection.execute(fotoSql, [codAnuncio, linkFoto.trim()]);
            } else {
                console.warn(`Link de foto inválido ou vazio ignorado para anúncio ${codAnuncio}:`, linkFoto);
            }
        }

        await connection.commit();
        res.status(201).json({ id: codAnuncio });

    } catch (err) {
        if (connection) await connection.rollback();
        // Log detalhado do erro
        console.error('Erro detalhado ao criar anúncio:', err);
        res.status(500).json({ error: 'Erro interno ao criar anúncio.', details: err.message });
    } finally {
        if (connection) connection.release(); // Liberar conexão de volta ao pool
    }
});

// PUT /anuncios/:id (Editar anúncio)
app.put('/anuncios/:id', async (req, res) => {
    const { id } = req.params;
    const { valor, descricao, fotos } = req.body; // Permitir editar valor, descrição e fotos

    // Validação básica (pode ser mais robusta)
    if (valor === undefined && descricao === undefined && fotos === undefined) {
        return res.status(400).json({ error: 'Pelo menos um campo (valor, descricao, fotos) deve ser fornecido para atualização.' });
    }

    let connection;
    try {
        console.log(`DEBUG: Tentando obter conexão para editar anúncio ${id}. Type of db.getConnection: ${typeof db?.getConnection}`);
        connection = await db.getConnection(); // Obter conexão do pool
        await connection.beginTransaction();

        // 1. Atualizar dados do Anuncio (se fornecidos)
        const updateFields = [];
        const updateParams = [];
        if (valor !== undefined) {
            updateFields.push('valor = ?');
            updateParams.push(valor);
        }
        if (descricao !== undefined) {
            updateFields.push('descricao = ?');
            updateParams.push(descricao || null);
        }

        if (updateFields.length > 0) {
            const updateAnuncioSql = `UPDATE Anuncio SET ${updateFields.join(', ')} WHERE CodAnuncio = ?`;
            updateParams.push(id);
            await connection.execute(updateAnuncioSql, updateParams);
        }

        // 2. Atualizar Fotos (se fornecidas)
        if (fotos && Array.isArray(fotos)) {
            // a. Deletar fotos antigas
            await connection.execute('DELETE FROM FotoAnuncio WHERE CodAnuncio = ?', [id]);
            // b. Inserir fotos novas
            if (fotos.length > 0) {
                const fotoSql = 'INSERT INTO FotoAnuncio (CodAnuncio, linkFoto) VALUES (?, ?)';
                for (const linkFoto of fotos) {
                    if (linkFoto && typeof linkFoto === 'string' && linkFoto.trim() !== '') { // Validação extra
                        await connection.execute(fotoSql, [id, linkFoto.trim()]);
                    }
                }
            } 
            // Se fotos for um array vazio, a exclusão acima já removeu todas.
        }

        await connection.commit();
        res.status(200).json({ message: 'Anúncio atualizado com sucesso.' });

    } catch (err) {
        if (connection) await connection.rollback();
        console.error('Erro ao atualizar anúncio:', err);
        res.status(500).json({ error: 'Erro interno ao atualizar anúncio.', details: err.message });
    } finally {
        if (connection) connection.release(); // Liberar conexão de volta ao pool
    }
});


// DELETE /anuncios/:id (Deletar anúncio e fotos associadas)
app.delete('/anuncios/:id', async (req, res) => {
    const { id } = req.params;
    let connection;
    try {
        console.log(`DEBUG: Tentando obter conexão para deletar anúncio ${id}. Type of db.getConnection: ${typeof db?.getConnection}`);
        connection = await db.getConnection(); // Obter conexão do pool
        await connection.beginTransaction();

        // 1. Deletar Fotos
        await connection.execute('DELETE FROM FotoAnuncio WHERE CodAnuncio = ?', [id]);

        // 2. Deletar Anuncio
        const [deleteResult] = await connection.execute('DELETE FROM Anuncio WHERE CodAnuncio = ?', [id]);

        await connection.commit();

        if (deleteResult.affectedRows > 0) {
            res.status(200).json({ message: 'Anúncio deletado com sucesso.' });
        } else {
            res.status(404).json({ message: 'Anúncio não encontrado.' });
        }

    } catch (err) {
        if (connection) await connection.rollback();
        console.error('Erro ao deletar anúncio:', err);
        res.status(500).json({ error: 'Erro interno ao deletar anúncio.', details: err.message });
    } finally {
        if (connection) connection.release(); // Liberar conexão de volta ao pool
    }
});


// --- Rotas Chat e Mensagem ---

// GET /chats/:userId (Listar chats de um usuário)
app.get('/chats/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const sql = `
            SELECT 
                c.codChat,
                c.Codpessoa1,
                p1.nome as nomePessoa1,
                c.Codpessoa2,
                p2.nome as nomePessoa2,
                (
                    SELECT m.texto 
                    FROM Mensagem m 
                    WHERE m.codChat = c.codChat 
                    ORDER BY m.codMensagem DESC 
                    LIMIT 1
                ) as ultimaMensagem,
                 (
                    SELECT m.codMensagem 
                    FROM Mensagem m 
                    WHERE m.codChat = c.codChat 
                    ORDER BY m.codMensagem DESC 
                    LIMIT 1
                ) as ultimaMensagemId
            FROM Chat c
            JOIN Pessoa p1 ON c.Codpessoa1 = p1.CodPessoa
            JOIN Pessoa p2 ON c.Codpessoa2 = p2.CodPessoa
            WHERE c.Codpessoa1 = ? OR c.Codpessoa2 = ?
            ORDER BY ultimaMensagemId DESC -- Ordena pela ID da última mensagem
        `;
        const chats = await queryDB(sql, [userId, userId]);
        res.json(chats);
    } catch (err) {
        console.error('Erro ao buscar chats:', err.message);
        res.status(500).json({ error: 'Erro interno ao buscar chats.' });
    }
});

// POST /chats (Iniciar/Obter chat entre duas pessoas)
app.post('/chats', async (req, res) => {
    const { codPessoa1, codPessoa2 } = req.body;

    if (!codPessoa1 || !codPessoa2) {
        return res.status(400).json({ error: 'IDs dos dois participantes são obrigatórios.' });
    }
    if (codPessoa1 === codPessoa2) {
        return res.status(400).json({ error: 'Não é possível iniciar um chat consigo mesmo.' });
    }

    // Garante ordem consistente para evitar duplicatas (menor ID primeiro)
    const [p1, p2] = [codPessoa1, codPessoa2].sort((a, b) => a - b);

    try {
        // 1. Verificar se o chat já existe
        const checkSql = 'SELECT * FROM Chat WHERE Codpessoa1 = ? AND Codpessoa2 = ?';
        const existingChats = await queryDB(checkSql, [p1, p2]);

        if (existingChats.length > 0) {
            // Se existe, retorna o chat existente
            // Busca nomes para retornar info completa como no GET /chats/:userId
            const chatCompleto = await queryDB(`
                SELECT c.*, p1.nome as nomePessoa1, p2.nome as nomePessoa2 
                FROM Chat c 
                JOIN Pessoa p1 ON c.Codpessoa1 = p1.CodPessoa 
                JOIN Pessoa p2 ON c.Codpessoa2 = p2.CodPessoa 
                WHERE c.codChat = ?`, 
                [existingChats[0].codChat]
            );
            return res.status(200).json(chatCompleto[0]);
        }

        // 2. Se não existe, cria o novo chat
        const insertSql = 'INSERT INTO Chat (Codpessoa1, Codpessoa2) VALUES (?, ?)';
        const result = await executeDB(insertSql, [p1, p2]);
        const newChatId = result.insertId;

        // Busca o chat recém-criado com nomes para retornar info completa
         const chatRecemCriado = await queryDB(`
            SELECT c.*, p1.nome as nomePessoa1, p2.nome as nomePessoa2 
            FROM Chat c 
            JOIN Pessoa p1 ON c.Codpessoa1 = p1.CodPessoa 
            JOIN Pessoa p2 ON c.Codpessoa2 = p2.CodPessoa 
            WHERE c.codChat = ?`, 
            [newChatId]
        );

        res.status(201).json(chatRecemCriado[0]);

    } catch (err) {
        console.error('Erro ao iniciar/obter chat:', err);
        res.status(500).json({ error: 'Erro interno ao iniciar/obter chat.', details: err.message });
    }
});

// GET /mensagens/:chatId (Listar mensagens de um chat)
app.get('/mensagens/:chatId', async (req, res) => {
    const { chatId } = req.params;
    try {
        const sql = `
            SELECT m.codMensagem, m.codChat, m.codPessoa, m.texto, p.nome as nomePessoa
            FROM Mensagem m
            JOIN Pessoa p ON m.codPessoa = p.CodPessoa
            WHERE m.codChat = ?
            ORDER BY m.codMensagem ASC
        `;
        const rows = await queryDB(sql, [chatId]);
        res.json(rows);
    } catch (err) {
        console.error('Erro ao buscar mensagens:', err.message);
        res.status(500).json({ error: 'Erro interno ao buscar mensagens.' });
    }
});

// POST /mensagens (Criar nova mensagem em um chat)
app.post('/mensagens', async (req, res) => {
    const { codRemetente, codDestinatario, texto } = req.body;

    if (!codRemetente || !codDestinatario || !texto || texto.trim() === '') {
        return res.status(400).json({ error: 'Remetente, destinatário e texto não vazio são obrigatórios.' });
    }

    let connection;
    try {
        console.log(`DEBUG: Tentando obter conexão para enviar mensagem. Type of db.getConnection: ${typeof db?.getConnection}`);
        connection = await db.getConnection(); // Obter conexão do pool
        await connection.beginTransaction();

        // 1. Encontrar ou criar o chat
        const [p1, p2] = [codRemetente, codDestinatario].sort((a, b) => a - b);
        let [chats] = await connection.execute('SELECT codChat FROM Chat WHERE Codpessoa1 = ? AND Codpessoa2 = ?', [p1, p2]);
        let chatId;

        if (chats.length === 0) {
            // Cria o chat se não existir
            const [insertChatResult] = await connection.execute('INSERT INTO Chat (Codpessoa1, Codpessoa2) VALUES (?, ?)', [p1, p2]);
            chatId = insertChatResult.insertId;
        } else {
            chatId = chats[0].codChat;
        }

        // 2. Inserir a mensagem
        const insertMsgSql = 'INSERT INTO Mensagem (codChat, codPessoa, texto) VALUES (?, ?, ?)';
        const [insertMsgResult] = await connection.execute(insertMsgSql, [chatId, codRemetente, texto]);
        const codMensagem = insertMsgResult.insertId;

        await connection.commit();

        // Retorna a mensagem criada (sem buscar no banco novamente por performance)
        res.status(201).json({ codMensagem, codChat: chatId, codPessoa: codRemetente, texto });

    } catch (err) {
        if (connection) await connection.rollback();
        console.error('Erro ao enviar mensagem:', err);
        res.status(500).json({ error: 'Erro interno ao enviar mensagem.', details: err.message });
    } finally {
        if (connection) connection.release(); // Liberar conexão de volta ao pool
    }
});

// DELETE /chats/:chatId (Deletar chat e mensagens associadas)
app.delete('/chats/:chatId', async (req, res) => {
    const { chatId } = req.params;
    let connection;
    try {
        console.log(`DEBUG: Tentando obter conexão para deletar chat ${chatId}. Type of db.getConnection: ${typeof db?.getConnection}`);
        connection = await db.getConnection(); // Obter conexão do pool
        await connection.beginTransaction();

        // 1. Deletar Mensagens
        await connection.execute('DELETE FROM Mensagem WHERE codChat = ?', [chatId]);

        // 2. Deletar Chat
        const [deleteResult] = await connection.execute('DELETE FROM Chat WHERE codChat = ?', [chatId]);

        await connection.commit();

        if (deleteResult.affectedRows > 0) {
            res.status(200).json({ message: 'Chat deletado com sucesso.' });
        } else {
            res.status(404).json({ message: 'Chat não encontrado.' });
        }

    } catch (err) {
        if (connection) await connection.rollback();
        console.error('Erro ao deletar chat:', err);
        res.status(500).json({ error: 'Erro interno ao deletar chat.', details: err.message });
    } finally {
        if (connection) connection.release(); // Liberar conexão de volta ao pool
    }
});


// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    // Testar conexão inicial com o banco (opcional, mas útil)
    db.getConnection()
        .then(conn => {
            console.log('Conectado ao banco MySQL com sucesso!');
            conn.release();
        })
        .catch(err => {
            console.error('Erro ao conectar ao banco MySQL:', err);
        });
});

