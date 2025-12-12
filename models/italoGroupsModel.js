const pool = require('../db/pool_produtos');
const poolMain = require('../db/pool_main');

exports.getAllGroups = async () => {
    const result = await pool.query(
        'SELECT grup_codigo, LOWER(grup_descricao) AS grup_descricao FROM public.grupos'
    );
    return result.rows;
};

exports.getProdutosComConcorrentesDinamico = async (grupoCodigo, italoBasesId) => {
    // Buscar produtos do ERP
    const produtosResult = await pool.query(
        `SELECT 
           produto.prod_descricao, 
           produto.prod_codbarras, 
           produn.prun_prvenda AS valor_loja
         FROM erp.public.produtos produto
         JOIN erp.public.produn produn ON produn.prun_prod_codigo = produto.prod_codigo
         WHERE produto.prod_grup_codigo = $1`,
        [grupoCodigo]
    );
    const produtos = produtosResult.rows;
    if (!produtos.length) return [];

    // Buscar todas as ofertas da base selecionada
    const gtins = produtos.map(p => p.prod_codbarras);

    const ofertasResult = await poolMain.query(
        `SELECT 
           gtin, 
           valor, 
           geohash, 
           nome_emp AS nome_empresa,
           estabelecimento_nome
         FROM portal.dadosbi.menorpreco_ofertas
         WHERE gtin = ANY($1) AND concorrentes_bases_id = $2`,
        [gtins, italoBasesId]
    );
    const ofertas = ofertasResult.rows;

    // Criar mapa de ofertas por GTIN
    const ofertasMap = new Map();
    for (const o of ofertas) {
        if (!ofertasMap.has(o.gtin)) ofertasMap.set(o.gtin, []);
        ofertasMap.get(o.gtin).push({
            geohash: o.geohash,
            valor: o.valor,
            nome_empresa: o.nome_empresa,
            estabelecimento_nome: o.estabelecimento_nome
        });
    }

    // Agrupar produtos por GTIN para evitar duplicidade e manter apenas produtos com concorrentes
    const produtosPorGtin = new Map();
    for (const p of produtos) {
        if (!produtosPorGtin.has(p.prod_codbarras)) {
            const concorrentes = ofertasMap.get(p.prod_codbarras);
            if (concorrentes && concorrentes.length > 0) {
                produtosPorGtin.set(p.prod_codbarras, { ...p, concorrentes });
            }
        }
    }

    const produtosComConcorrentes = Array.from(produtosPorGtin.values());
    console.log('Produtos filtrados com concorrentes:', produtosComConcorrentes);
    console.log('Total de produtos com concorrentes:', produtosComConcorrentes[0].concorrentes);

    return produtosComConcorrentes;
};
