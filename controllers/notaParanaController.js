const searchService = require('../services/notaParanaService');
const productsModel = require('../models/productsModel');

exports.search = async (req, res) => {
    try {
        const { local, gtin, termo } = req.query;
        const data = await searchService.search(local, gtin, termo);

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
