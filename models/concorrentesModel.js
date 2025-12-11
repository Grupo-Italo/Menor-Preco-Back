const pool = require('../db/pool_main');

exports.findByConcorrentBaseId = async (italoBaseId) => {
    const result = await pool.query('SELECT * FROM dadosbi.np_concorrentes_bases WHERE italo_bases_id = $1', [italoBaseId]);
    return result.rows;
};

exports.findConcorrenteId = async (geohash, italoBaseId) => {
    const query = `
    SELECT id 
    FROM dadosbi.np_concorrentes_bases
    WHERE geohash = $1
    AND italo_bases_id = $2
    LIMIT 1
  `;
    const result = await pool.query(query, [geohash, italoBaseId]);
    return result.rows[0]?.id || null;
};
