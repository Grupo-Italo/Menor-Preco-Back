const productsModel = require('../models/productsModel');
const produtosErpModel = require('../models/produtosErpModel');

exports.getProducts = async (req, res) => {
    try {
        const products = await productsModel.getAllProducts();
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getProductsByGtin = async (req, res) => {
    try {
        const { gtin } = req.query; 
        const products = await produtosErpModel.getProductsByGtin(gtin);
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createOrUpdateProductsBulk = async (req, res) => {
    try {
        const product = await productsModel.createOrUpdateProductsBulk(req.body);
        res.json({ message: 'Dados gravados com sucesso' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};