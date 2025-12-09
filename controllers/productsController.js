const productsModel = require('../models/productsModel');

exports.getProducts = async (req, res) => {
    try {
        const products = await productsModel.getAll();
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// exports.createProduct = async (req, res) => {
//     const { nome, email } = req.body;
//     try {
//         const product = await productsModel.create(nome, email);
//         res.json(product);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// exports.updateProduct = async (req, res) => {
//     const { id } = req.params;
//     const { nome, email } = req.body;
//     try {
//         await productsModel.update(id, nome, email);
//         res.json({ message: 'Produto atualizado!' });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };