const np_italo_bases = require('../models/italoBasesModel');

exports.getCities = async (req, res) => {
    try {
        const bases = await np_italo_bases.getAllCities();
        res.json(bases);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getBases = async (req, res) => {
    try {
        const { name } = req.query;
        const bases = await np_italo_bases.getAllBases(name);
        res.json(bases);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }   
};