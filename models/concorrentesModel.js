const pool = require('../db/pool_main');

exports.findByConcorrentBaseId = async (italoBaseId) => {
    const result = await pool.query('SELECT * FROM dadosbi.np_concorrentes_bases WHERE italo_bases_id = $1', [italoBaseId]);
    return result.rows;
};

// No model concorrentesModel.js
exports.findConcorrenteId = async (geohash, nomeEmpresa, italoBaseId) => {
    const query = `
    SELECT id 
    FROM dadosbi.np_concorrentes_bases
    WHERE geohash = $1
    AND nome_empresa = $2
    AND italo_bases_id = $3
    LIMIT 1
  `;
    const result = await pool.query(query, [geohash, nomeEmpresa, italoBaseId]);
    return result.rows[0]?.id || null;
};