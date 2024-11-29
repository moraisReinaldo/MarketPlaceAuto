import { dirname, join } from 'path';  // Certifique-se de importar o join de 'path'
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';

// Caminho do diretório onde está o arquivo
const __dirname = dirname(fileURLToPath(import.meta.url));

// Caminho do banco de dados
const dbPath = join(__dirname, '../assets/banco.db');

// Caminho para o banco de dados

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err.message);
    } else {
        console.log('Conectado ao banco SQLite.');
    }
});

// Função para realizar consultas SQL (SELECT)
export const queryDB = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);  // Caso ocorra um erro na consulta
            } else {
                resolve(rows);  // Retorna as linhas da consulta
            }
        });
    });
};

// Função para executar um comando de INSERT, UPDATE ou DELETE
export const executeDB = async (query, params = []) => {
    try {
        return await new Promise((resolve, reject) => {
            db.run(query, params, function (err) {
                if (err) {
                    reject(err); // Caso ocorra um erro
                } else {
                    resolve(this.lastID); // Retorna o último ID inserido
                }
            });
        });
    } catch (err) {
        throw new Error(`Erro ao executar a operação no banco de dados: ${err.message}`);
    }
};
