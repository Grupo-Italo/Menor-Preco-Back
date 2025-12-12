const pool = require('../db/pool_produtos');
const poolMain = require('../db/pool_main');

exports.getAllGroups = async () => {
    const result = await pool.query(`
    SELECT MIN(grup_codigo) as grup_codigo,
           LOWER(grup_descricao) AS grup_descricao
    FROM public.grupos
    WHERE grup_descricao IS NOT NULL
    GROUP BY LOWER(grup_descricao)
    ORDER BY grup_descricao`);
    return result.rows;
};

exports.getProdutosComConcorrentesDinamico = async (grupoCodigo, italoBasesId, marca) => {
    try {
        // Busca a unidade (loja) vinculada à base Ítalo
        const italoUnidadeCodigoResult = await poolMain.query(
            `SELECT prun_unid_codigo, id FROM portal.dadosbi.np_italo_bases WHERE id = $1`,
            [italoBasesId]
        );
        
        const italoUnidadeCodigo = italoUnidadeCodigoResult.rows[0];

    // Normaliza a marca: transforma string vazia, "undefined", "null" ou apenas espaços em null
    const marcaParam = marca && 
                       marca !== 'undefined' && 
                       marca !== 'null' && 
                       marca.trim() !== '' 
                       ? marca.trim().toUpperCase() 
                       : null;
    
    // Busca produtos da loja correspondente ao grupo informado
    const produtosResult = await pool.query(
        `SELECT 
            produto.prod_descricao, 
            produto.prod_codbarras, 
            produto.prod_marca,
            produn.prun_prvenda AS valor_loja,
            produn.prun_prvenda2 AS promocao_loja,
            produn.prun_prvenda3 AS atacado_loja,
            produn.prun_unid_codigo
         FROM erp.public.produtos produto
         JOIN erp.public.produn produn ON produn.prun_prod_codigo = produto.prod_codigo
         WHERE produto.prod_grup_codigo = $1 
           AND produto.prod_status = 'N' 
           AND produn.prun_unid_codigo = $2
           AND ($3::text IS NULL OR UPPER(produto.prod_marca) = $3)
        `,
        [grupoCodigo, italoUnidadeCodigo.prun_unid_codigo, marcaParam]
    );

    const produtosRows = produtosResult.rows;
    
    // Garantir que cada GTIN apareça apenas uma vez
    const produtosMap = new Map();
    for (const p of produtosRows) {
        const gtin = p.prod_codbarras;
        if (!gtin) continue;
        if (!produtosMap.has(gtin)) {
            produtosMap.set(gtin, {
                prod_descricao: p.prod_descricao,
                prod_codbarras: gtin,
                prod_marca: p.prod_marca,
                valor_loja: p.valor_loja,
                promocao_loja: p.promocao_loja,
                atacado_loja: p.atacado_loja
            });
        }
    }

    const produtos = Array.from(produtosMap.values());

    // Lista de GTINs únicos usada para filtrar ofertas no menor preço
    const gtins = Array.from(new Set(produtos.map(p => p.prod_codbarras)));

    // Busca todos os concorrentes associados à mesma base Ítalo
    const concorrentesPorBaseResult = await poolMain.query(
        `SELECT id FROM portal.dadosbi.np_concorrentes_bases WHERE italo_bases_id = $1`,
        [italoBasesId]
    );

    // Pode haver vários concorrentes
    const concorrentesPorBase = concorrentesPorBaseResult.rows.map(r => r.id);

    // Busca ofertas dos concorrentes para os GTINs encontrados
    const ofertasResult = await poolMain.query(
        `SELECT DISTINCT
            gtin,
            valor,
            geohash,
            nome_emp AS nome_empresa,
            estabelecimento_nome
         FROM portal.dadosbi.menorpreco_ofertas
         WHERE gtin = ANY($1) AND concorrentes_bases_id = ANY($2)
         ORDER BY gtin, nome_empresa, estabelecimento_nome, valor`,
        [gtins, concorrentesPorBase]
    );

    const ofertas = ofertasResult.rows || [];

    // Agrupa todas as ofertas por GTIN, evitando registros duplicados
    const ofertasMap = new Map();
    for (const o of ofertas) {
        const gtin = o.gtin;
        if (!gtin) continue;

        if (!ofertasMap.has(gtin)) ofertasMap.set(gtin, []);
        const list = ofertasMap.get(gtin);

        // Elimina duplicidade exata
        const exists = list.some(item =>
            item.valor === o.valor &&
            item.nome_empresa === o.nome_empresa &&
            item.estabelecimento_nome === o.estabelecimento_nome &&
            item.geohash === o.geohash
        );

        if (!exists) {
            list.push({
                valor: o.valor,
                geohash: o.geohash,
                nome_empresa: o.nome_empresa,
                estabelecimento_nome: o.estabelecimento_nome
            });
        }
    }

    // Associa concorrentes aos produtos e retorna somente os que possuem ofertas
    const produtosComConcorrentes = produtos
        .map(p => {
            const concorrentes = ofertasMap.get(p.prod_codbarras) || [];
            return { ...p, concorrentes };
        })
        .filter(p => p.concorrentes && p.concorrentes.length > 0);

    return produtosComConcorrentes;
    } catch (error) {
        throw error;
    }
};