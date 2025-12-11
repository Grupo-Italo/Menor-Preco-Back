const pool = require('../db/pool_main');

exports.findByConcorrentBaseId = async (italoBaseId) => {
    const result = await pool.query('SELECT * FROM dadosbi.np_concorrentes_bases WHERE italo_bases_id = $1', [italoBaseId]);
    return result.rows;
};