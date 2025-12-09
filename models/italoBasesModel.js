const pool = require('../db');

exports.getAll = async () => {
    const result = await pool.query('select * from dadosbi.np_italo_bases');
    return result.rows;
};