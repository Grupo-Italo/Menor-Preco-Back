const pool = require('../db/pool_produtos');

exports.getProductsByGtin = async (gtin) => {
    const query = `
        SELECT 
            prod_codigo, 
            prod_descricao, 
            prod_marca
        FROM public.produtos
        WHERE 
            prod_status = 'N'
            AND prod_codbarras = $1
    `;

    const result = await pool.query(query, [gtin]);
    return result.rows;
};