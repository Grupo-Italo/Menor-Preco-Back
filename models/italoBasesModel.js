const pool = require('../db');

exports.getAllCities = async () => {
    const result = await pool.query('select distinct cidade from dadosbi.np_italo_bases');
    return result.rows;
};

exports.getAllBases = async (name) => {
    const result = await pool.query(
        'select nome, geohash from dadosbi.np_italo_bases where cidade ILIKE $1',
        [`%${name}%`]
    );
    return result.rows;
};