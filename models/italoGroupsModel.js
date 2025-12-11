const pool = require('../db/pool_produtos');

exports.getAllGroups = async () => {
    const result = await pool.query('SELECT grup_codigo, LOWER(grup_descricao) AS grup_descricao FROM public.grupos');
    return result.rows;
};