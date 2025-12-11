require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME_PRODUTOS,
    port: process.env.DB_PORT,
    
    //máximo de conexões
    max: 20,
    
    //desconecta inativas
    idleTimeoutMillis: 30000,
    
    //timeout ao tentar conectar
    connectionTimeoutMillis: 5000 
});

module.exports = pool;
