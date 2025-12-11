const pool = require('../db/pool_main');

exports.getAllCities = async () => {
    const result = await pool.query('select distinct cidade from dadosbi.np_italo_bases');
    return result.rows;
};

exports.findByGeohash = async (geohash) => {
    const result = await pool.query('SELECT * FROM dadosbi.np_italo_bases WHERE geohash = $1', [geohash]);
    return result.rows;
};

exports.getAllBases = async (name) => {
    const result = await pool.query(
        'select nome, geohash from dadosbi.np_italo_bases where cidade ILIKE $1',
        [`%${name}%`]
    );
    return result.rows;
};