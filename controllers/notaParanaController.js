const searchService = require('../services/notaParanaService');
const productsModel = require('../models/productsModel');
const concorrentesModel = require('../models/concorrentesModel');
const italobasesModel = require('../models/italoBasesModel');
const produtosErpModel = require('../models/produtosErpModel');

exports.search = async (req, res) => {
    try {
        const { local, gtin, termo, raio } = req.query;

        const italoBase = await italobasesModel.findByGeohash(local);

        if (!italoBase) {
            return res.status(404).json({ error: 'Base Italo não encontrada para este geohash' });
        }

        const concorrentes = await concorrentesModel.findByConcorrentBaseId(italoBase[0].id);

        const data = await searchService.search(local, gtin, termo);

        // Filtra por raio, se fornecido
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

        // Filtra por concorrentes vinculados à base Italo
        if (data?.produtos?.length) {
            data.produtos = data.produtos.filter(prod => {
                return concorrentes.some(c => {
                    const sameGeohash = c.geohash === prod.local;
                    return sameGeohash;
                });
            });
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
                fetched_at: new Date().toISOString(),
                nome_emp: produto.estabelecimento.nm_emp,
                geohash: produto.local
            }));

            await productsModel.createOrUpdateProductsBulk(produtosBulk);
        }

        // Busca adicional no seu banco interno
        let productInfo = [];
        if (gtin) {
            productInfo = await produtosErpModel.getProductsByGtin(gtin);
        }

        // Retorno final consolidado
        res.json({
            ...data,
            productInfo
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
