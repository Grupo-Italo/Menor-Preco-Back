const pool = require('../db');

exports.getAllProducts = async () => {
    const result = await pool.query('SELECT * FROM dadosbi.menorpreco_ofertas');
    return result.rows;
};

exports.createOrUpdateProductsBulk = async (produtos) => {
    if (!produtos?.length) return;

    // Filtra apenas produtos com gtin (obrigatório)
    const produtosValidos = produtos.filter(p => p.gtin);
    
    if (!produtosValidos.length) return; // Se nenhum tem gtin, apenas não grava nada

    const columns = [
        "gtin",
        "produto_desc",
        "ncm",
        "valor",
        "valor_tabela",
        "datahora",
        "distkm",
        "estabelecimento_codigo",
        "estabelecimento_nome",
        "municipio",
        "uf",
        "nrdoc",
        "fetched_at"
    ];

    // Gera os VALUES e PLACEHOLDERS automaticamente
    const values = [];
    const placeholders = produtosValidos.map((p, rowIndex) => {
        const rowPlaceholders = columns.map((col) => {
            values.push(p[col] || null);
            return `$${values.length}`;
        });

        return `(${rowPlaceholders.join(", ")})`;
    });

    // UPSERT — baseado nas chaves únicas
    const query = `
        INSERT INTO dadosbi.menorpreco_ofertas (${columns.join(", ")})
        VALUES ${placeholders.join(", ")}
        ON CONFLICT (gtin, estabelecimento_codigo, nrdoc)
        DO UPDATE SET
            produto_desc = EXCLUDED.produto_desc,
            ncm = EXCLUDED.ncm,
            valor = EXCLUDED.valor,
            valor_tabela = EXCLUDED.valor_tabela,
            datahora = EXCLUDED.datahora,
            distkm = EXCLUDED.distkm,
            estabelecimento_nome = EXCLUDED.estabelecimento_nome,
            municipio = EXCLUDED.municipio,
            uf = EXCLUDED.uf,
            fetched_at = EXCLUDED.fetched_at;
    `;

    await pool.query(query, values);
};

