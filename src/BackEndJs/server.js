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

// Função auxiliar para consultas SELECT
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

// Função auxiliar para INSERT, UPDATE, DELETE
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
        // Verificar se já existe usuário com o mesmo nome de usuário
        const existingUsername = await queryDB('SELECT CodPessoa FROM Pessoa WHERE usuario = ?', [usuario]);
        if (existingUsername.length > 0) {
            return res.status(409).json({ error: 'Nome de usuário já cadastrado.' });
        }

        // Verificar se já existe usuário com o mesmo nome completo
        const existingName = await queryDB('SELECT CodPessoa FROM Pessoa WHERE nome = ?', [nome]);
        if (existingName.length > 0) {
            return res.status(409).json({ error: 'Nome já cadastrado. Por favor, use um nome diferente.' });
        }

        const hashedSenha = await bcrypt.hash(senha, saltRounds);
        const sql = 'INSERT INTO Pessoa (nome, usuario, senha) VALUES (?, ?, ?)';
        const result = await executeDB(sql, [nome, usuario, hashedSenha]);
        res.status(201).json({ id: result.insertId, nome: nome, usuario: usuario });

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
            return res.status(401).json({ error: 'Usuário ou senha inválidos.' });
        }

        const user = users[0];
        const match = await bcrypt.compare(senha, user.senha);

        if (!match) {
            return res.status(401).json({ error: 'Usuário ou senha inválidos.' });
        }

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
        connection = await db.getConnection();
        await connection.beginTransaction();

        const [anuncios] = await connection.execute('SELECT CodAnuncio FROM Anuncio WHERE CodPessoa = ?', [id]);
        const anuncioIds = anuncios.map(a => a.CodAnuncio);

        if (anuncioIds.length > 0) {
            const deleteFotosSql = `DELETE FROM FotoAnuncio WHERE CodAnuncio IN (${anuncioIds.map(() => '?').join(',')})`;
            await connection.execute(deleteFotosSql, anuncioIds);
        }

        await connection.execute('DELETE FROM Anuncio WHERE CodPessoa = ?', [id]);

        const [chats] = await connection.execute('SELECT codChat FROM Chat WHERE Codpessoa1 = ? OR Codpessoa2 = ?', [id, id]);
        const chatIds = chats.map(c => c.codChat);

        if (chatIds.length > 0) {
            const deleteMsgsSql = `DELETE FROM Mensagem WHERE codChat IN (${chatIds.map(() => '?').join(',')})`;
            await connection.execute(deleteMsgsSql, chatIds);
        }

        await connection.execute('DELETE FROM Chat WHERE Codpessoa1 = ? OR Codpessoa2 = ?', [id, id]);
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
        if (connection) connection.release();
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
        // Busca versões sem o campo ano (removido da tabela)
        const rows = await queryDB('SELECT CodVersao, nome FROM Versao WHERE CodModelo = ? ORDER BY nome', [codModelo]);
        
        // Adiciona um campo ano padrão para compatibilidade com o frontend
        const versoes = rows.map(versao => ({
            ...versao,
            ano: null // Valor padrão para manter compatibilidade
        }));
        
        res.json(versoes);
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
                a.CodAnuncio, a.valor, a.descricao, a.local, a.ano, -- Selecionar a.ano e a.local
                p.CodPessoa, p.nome as nomeVendedor,
                v.CodVersao, v.nome as nomeVersao, 
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
        // Filtrar pelo ano do anúncio (a.ano)
        if (ano) {
            conditions.push('a.ano = ?'); 
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

// GET /anuncios/:id (Buscar anúncio específico por ID)
app.get('/anuncios/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const anuncioSql = `
            SELECT 
                a.CodAnuncio, a.valor, a.descricao, a.local, a.ano, -- Selecionar a.ano e a.local
                p.CodPessoa, p.nome as nomeVendedor,
                v.CodVersao, v.nome as nomeVersao,
                m.CodModelo, m.nome as nomeModelo
            FROM Anuncio a
            JOIN Pessoa p ON a.CodPessoa = p.CodPessoa
            JOIN Versao v ON a.CodVersao = v.CodVersao
            JOIN Modelo m ON v.CodModelo = m.CodModelo
            WHERE a.CodAnuncio = ?
        `;
        const anuncios = await queryDB(anuncioSql, [id]);

        if (anuncios.length === 0) {
            return res.status(404).json({ message: 'Anúncio não encontrado.' });
        }

        const anuncio = anuncios[0];
        const fotos = await queryDB('SELECT CodFoto, linkFoto FROM FotoAnuncio WHERE CodAnuncio = ?', [id]);
        anuncio.fotos = fotos;

        res.json(anuncio);

    } catch (err) {
        console.error(`Erro ao buscar anúncio ${id}:`, err.message);
        res.status(500).json({ error: 'Erro interno ao buscar anúncio.', details: err.message });
    }
});

// POST /anuncios (Criar novo anúncio)
app.post('/anuncios', async (req, res) => {
    // Adicionar 'ano' e 'local' à desestruturação
    const { valor, descricao, codPessoa, codVersao, fotos, ano, local } = req.body;

    // Adicionar 'ano' e 'local' à validação
    if (!valor || !codPessoa || !codVersao || !ano || !local || !fotos || !Array.isArray(fotos) || fotos.length === 0) {
        return res.status(400).json({ error: 'Campos valor, codPessoa, codVersao, ano, local e pelo menos uma foto são obrigatórios.' });
    }

    // Validar ano (exemplo simples)
    if (isNaN(parseInt(ano)) || parseInt(ano) < 1900 || parseInt(ano) > new Date().getFullYear() + 2) { // Permitir ano seguinte
        return res.status(400).json({ error: 'Ano inválido.' });
    }

    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        // Incluir 'ano' e 'local' no INSERT
        const anuncioSql = 'INSERT INTO Anuncio (valor, descricao, CodPessoa, CodVersao, ano, local) VALUES (?, ?, ?, ?, ?, ?)';
        const [anuncioResult] = await connection.execute(anuncioSql, [valor, descricao || null, codPessoa, codVersao, parseInt(ano), local]);
        const codAnuncio = anuncioResult.insertId;

        const fotoSql = 'INSERT INTO FotoAnuncio (CodAnuncio, linkFoto) VALUES (?, ?)';
        for (const linkFoto of fotos) {
            if (linkFoto && typeof linkFoto === 'string' && linkFoto.trim() !== '') {
                 await connection.execute(fotoSql, [codAnuncio, linkFoto.trim()]);
            } else {
                console.warn(`Link de foto inválido ou vazio ignorado para anúncio ${codAnuncio}:`, linkFoto);
            }
        }

        await connection.commit();
        res.status(201).json({ id: codAnuncio });

    } catch (err) {
        if (connection) await connection.rollback();
        console.error('Erro detalhado ao criar anúncio:', err);
        res.status(500).json({ error: 'Erro interno ao criar anúncio.', details: err.message });
    } finally {
        if (connection) connection.release();
    }
});

// PUT /anuncios/:id (Editar anúncio)
app.put('/anuncios/:id', async (req, res) => {
    const { id } = req.params;
    // Permitir editar valor, descrição, fotos, ano, local e codVersao
    const { valor, descricao, fotos, ano, local, codVersao } = req.body; 

    // Validação básica (pode ser mais robusta)
    if (valor === undefined && descricao === undefined && fotos === undefined && ano === undefined && local === undefined && codVersao === undefined) {
        return res.status(400).json({ error: 'Pelo menos um campo (valor, descricao, fotos, ano, local, codVersao) deve ser fornecido para atualização.' });
    }
    
    // Validar ano se fornecido
    if (ano !== undefined && (isNaN(parseInt(ano)) || parseInt(ano) < 1900 || parseInt(ano) > new Date().getFullYear() + 2)) {
        return res.status(400).json({ error: 'Ano inválido fornecido para atualização.' });
    }

    let connection;
    try {
        connection = await db.getConnection();
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
        if (ano !== undefined) {
            updateFields.push('ano = ?');
            updateParams.push(parseInt(ano));
        }
        if (local !== undefined) {
            updateFields.push('local = ?');
            updateParams.push(local);
        }
        if (codVersao !== undefined) {
            // Adicionar validação se a versão pertence ao mesmo modelo? Opcional.
            updateFields.push('CodVersao = ?');
            updateParams.push(codVersao);
        }

        if (updateFields.length > 0) {
            const updateAnuncioSql = `UPDATE Anuncio SET ${updateFields.join(', ')} WHERE CodAnuncio = ?`;
            updateParams.push(id);
            const [updateResult] = await connection.execute(updateAnuncioSql, updateParams);
            if (updateResult.affectedRows === 0) {
                 // Se não afetou linhas, o anúncio não existe, fazer rollback e retornar 404
                await connection.rollback();
                return res.status(404).json({ message: 'Anúncio não encontrado para atualização.' });
            }
        }

        // 2. Atualizar Fotos (se fornecidas)
        if (fotos && Array.isArray(fotos)) {
            await connection.execute('DELETE FROM FotoAnuncio WHERE CodAnuncio = ?', [id]);
            if (fotos.length > 0) {
                const fotoSql = 'INSERT INTO FotoAnuncio (CodAnuncio, linkFoto) VALUES (?, ?)';
                for (const linkFoto of fotos) {
                    if (linkFoto && typeof linkFoto === 'string' && linkFoto.trim() !== '') {
                        await connection.execute(fotoSql, [id, linkFoto.trim()]);
                    }
                }
            } 
        }

        await connection.commit();
        res.status(200).json({ message: 'Anúncio atualizado com sucesso.' });

    } catch (err) {
        if (connection) await connection.rollback();
        console.error('Erro ao atualizar anúncio:', err);
        res.status(500).json({ error: 'Erro interno ao atualizar anúncio.', details: err.message });
    } finally {
        if (connection) connection.release();
    }
});

// DELETE /anuncios/:id (Deletar anúncio e fotos associadas)
app.delete('/anuncios/:id', async (req, res) => {
    const { id } = req.params;
    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        await connection.execute('DELETE FROM FotoAnuncio WHERE CodAnuncio = ?', [id]);
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
        if (connection) connection.release();
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
            ORDER BY ultimaMensagemId DESC
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

    const [p1, p2] = [codPessoa1, codPessoa2].sort((a, b) => a - b);

    try {
        const checkSql = 'SELECT * FROM Chat WHERE Codpessoa1 = ? AND Codpessoa2 = ?';
        const existingChats = await queryDB(checkSql, [p1, p2]);

        if (existingChats.length > 0) {
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

        const insertSql = 'INSERT INTO Chat (Codpessoa1, Codpessoa2) VALUES (?, ?)';
        const result = await executeDB(insertSql, [p1, p2]);
        const newChatId = result.insertId;

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
        connection = await db.getConnection();
        await connection.beginTransaction();

        const [p1, p2] = [codRemetente, codDestinatario].sort((a, b) => a - b);
        let [chats] = await connection.execute('SELECT codChat FROM Chat WHERE Codpessoa1 = ? AND Codpessoa2 = ?', [p1, p2]);
        let chatId;

        if (chats.length === 0) {
            const [insertChatResult] = await connection.execute('INSERT INTO Chat (Codpessoa1, Codpessoa2) VALUES (?, ?)', [p1, p2]);
            chatId = insertChatResult.insertId;
        } else {
            chatId = chats[0].codChat;
        }

        const insertMsgSql = 'INSERT INTO Mensagem (codChat, codPessoa, texto) VALUES (?, ?, ?)';
        const [insertMsgResult] = await connection.execute(insertMsgSql, [chatId, codRemetente, texto]);
        const codMensagem = insertMsgResult.insertId;

        await connection.commit();
        res.status(201).json({ codMensagem, codChat: chatId, codPessoa: codRemetente, texto });

    } catch (err) {
        if (connection) await connection.rollback();
        console.error('Erro ao enviar mensagem:', err);
        res.status(500).json({ error: 'Erro interno ao enviar mensagem.', details: err.message });
    } finally {
        if (connection) connection.release();
    }
});

// DELETE /chats/:chatId (Deletar chat e mensagens associadas)
app.delete('/chats/:chatId', async (req, res) => {
    const { chatId } = req.params;
    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        await connection.execute('DELETE FROM Mensagem WHERE codChat = ?', [chatId]);
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
        if (connection) connection.release();
    }
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    db.getConnection()
        .then(conn => {
            console.log('Conectado ao banco MySQL com sucesso!');
            conn.release();
        })
        .catch(err => {
            console.error('Erro ao conectar ao banco MySQL:', err);
        });
});
