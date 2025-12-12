const pool = require('../db/pool_produtos');
const poolMain = require('../db/pool_main');

exports.getAllGroups = async () => {
  const result = await pool.query(`
    SELECT MIN(grup_codigo) as grup_codigo,
           LOWER(grup_descricao) AS grup_descricao
    FROM public.grupos
    WHERE grup_descricao IS NOT NULL
    GROUP BY LOWER(grup_descricao)
    ORDER BY grup_descricao
    LIMIT 1000
  `);
  return result.rows;
};

exports.getProdutosComConcorrentesDinamico = async (grupoCodigo, italoBasesId) => {

    // 0) Obter o código da unidade associada à base Italo
    const italoUnidadeCodigoResult = await poolMain.query(
        `SELECT prun_unid_codigo FROM portal.dadosbi.np_italo_bases WHERE id = $1`,
        [italoBasesId]
    );

      const italoUnidadeCodigo = italoUnidadeCodigoResult.rows[0].prun_unid_codigo;

  // 1) Buscar produtos do ERP (pode retornar várias linhas por prod_codbarras)
  const produtosResult = await pool.query(
    `SELECT 
       produto.prod_descricao, 
       produto.prod_codbarras, 
       produn.prun_prvenda AS valor_loja,
       produn.prun_prvenda2 AS promocao_loja,
       produn.prun_prvenda3 AS atacado_loja,
	   produn.prun_unid_codigo
     FROM erp.public.produtos produto
     JOIN erp.public.produn produn 
       ON produn.prun_prod_codigo = produto.prod_codigo
     WHERE produto.prod_grup_codigo = $1 AND prod_status = 'N' AND prun_unid_codigo = $2`,
    [grupoCodigo, italoUnidadeCodigo]
  );

  const produtosRows = produtosResult.rows;
  if (!produtosRows || produtosRows.length === 0) return [];

  // 2) Dedupe produtos por prod_codbarras (usar a primeira ocorrência)
  const produtosMap = new Map();
  for (const p of produtosRows) {
    const gtin = p.prod_codbarras;
    if (!gtin) continue; // pula sem GTIN
    if (!produtosMap.has(gtin)) {
      produtosMap.set(gtin, {
        prod_descricao: p.prod_descricao,
        prod_codbarras: gtin,
        valor_loja: p.valor_loja,
        promocao_loja: p.promocao_loja,
        atacado_loja: p.atacado_loja
      });
    }
    // se quiser agregar preços diferentes num array, pode ajustar aqui
  }
  const produtos = Array.from(produtosMap.values());
  if (!produtos.length) return [];

  // 3) Array único de GTINs para usar na query
  const gtins = Array.from(new Set(produtos.map(p => p.prod_codbarras)));

  // 4) Buscar ofertas — evitar linhas idênticas usando DISTINCT
  const ofertasResult = await poolMain.query(
    `SELECT DISTINCT
        gtin,
        valor,
        geohash,
        nome_emp AS nome_empresa,
        estabelecimento_nome
     FROM portal.dadosbi.menorpreco_ofertas
     WHERE gtin = ANY($1)
       -- opcional: filtrar por concorrentes_bases_id = $2 se quiser apenas da base selecionada
     ORDER BY gtin, nome_empresa, estabelecimento_nome, valor`,
    [gtins]
  );

  const ofertas = ofertasResult.rows || [];

  // 5) Map de ofertas por GTIN (evita duplicidade exata novamente)
  const ofertasMap = new Map();
  for (const o of ofertas) {
    const gtin = o.gtin;
    if (!gtin) continue;
    if (!ofertasMap.has(gtin)) ofertasMap.set(gtin, []);
    const list = ofertasMap.get(gtin);

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

  // 6) Montar produtos únicos com seus concorrentes (apenas produtos que tenham concorrentes)
  const produtosComConcorrentes = produtos
    .map(p => {
      const concorrentes = ofertasMap.get(p.prod_codbarras) || [];
      return { ...p, concorrentes };
    })
    .filter(p => p.concorrentes && p.concorrentes.length > 0);

  return produtosComConcorrentes;
};
