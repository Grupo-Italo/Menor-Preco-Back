const pool = require('../db/pool_produtos');

exports.getAllBrands = async () => {
    const result = await pool.query('SELECT DISTINCT UPPER(TRIM(prod_marca)) AS marca FROM produtos');
    return result.rows;
};