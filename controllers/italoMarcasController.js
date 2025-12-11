const getAllBrands = require('../models/italoMarcasModel');

exports.getAllBrands = async (req, res) => {
    try {
        const brands = await getAllBrands.getAllBrands();
        res.json(brands);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};