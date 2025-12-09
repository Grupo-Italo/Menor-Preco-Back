const np_italo_bases = require('../models/italoBasesModel');

exports.getBases = async (req, res) => {
    try {
        const bases = await np_italo_bases.getAll();
        res.json(bases);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};