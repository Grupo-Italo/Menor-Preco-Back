const productsModel = require('../models/productsModel');

exports.getProducts = async (req, res) => {
    try {
        const products = await productsModel.getAllProducts();
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

    exports.createOrUpdateProductsBulk = async (req, res) => {
    try {
        const product = await productsModel.createOrUpdateProductsBulk(req.body);
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};