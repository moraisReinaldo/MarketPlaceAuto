import mysql from 'mysql2/promise';

// Criação do pool de conexões MySQL (em vez de uma única conexão)
export const db = mysql.createPool({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'Reinaldohm1207$',
    database: 'MarketplaceAuto',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Testar conexão (opcional, pode ser removido após confirmar que funciona)
try {
    console.log('Tentando conectar ao banco MySQL...');
    // Teste simples para garantir que o pool está funcionando
    db.query('SELECT 1').then(() => {
        console.log('Pool de conexões MySQL criado com sucesso.');
    });
} catch (err) {
    console.error('Erro ao criar pool de conexões MySQL:', err.message);
}

// Função para realizar SELECT
export const queryDB = async (sql, params = []) => {
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

// Função para INSERT, UPDATE, DELETE
export const executeDB = async (sql, params = []) => {
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
