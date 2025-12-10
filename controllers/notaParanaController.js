const searchService = require('../services/notaParanaService');
const productsModel = require('../models/productsModel');

exports.search = async (req, res) => {
    try {
        const { local, gtin, termo, raio } = req.query;
        const data = await searchService.search(local, gtin, termo);

        if (raio && data?.produtos?.length) {
            const raioMeters = Number(raio);
            if (!Number.isNaN(raioMeters)) {
                data.produtos = data.produtos.filter(prod => {
                    let distVal = prod.distkm;
                    if (typeof distVal === 'string') distVal = distVal.replace(',', '.');
                    const distKm = parseFloat(distVal);
                    if (Number.isNaN(distKm)) return false;
                    return (distKm * 1000) <= raioMeters;
                });
            }
        }

        if (gtin && data?.produtos?.length) {
            const produtosBulk = data.produtos.map(produto => ({
                gtin: produto.gtin,
                produto_desc: produto.desc,
                ncm: produto.ncm,
                valor: produto.valor,
                valor_tabela: produto.valor_tabela,
                datahora: produto.datahora,
                distkm: produto.distkm,
                estabelecimento_codigo: produto.estabelecimento.codigo,
                estabelecimento_nome: produto.estabelecimento.nm_emp,
                municipio: produto.estabelecimento.mun,
                uf: produto.estabelecimento.uf,
                nrdoc: produto.nrdoc,
                fetched_at: new Date().toISOString()
            }));

            await productsModel.createOrUpdateProductsBulk(produtosBulk);
        }

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
