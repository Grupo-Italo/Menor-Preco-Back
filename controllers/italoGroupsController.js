const getAllGroups = require('../models/italoGroupsModel');

exports.getAllGroups = async (req, res) => {
    try {
        const groups = await getAllGroups.getAllGroups();
        res.json(groups);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getProdutosComConcorrentesDinamico = async (req, res) => {
    try {
        const result = await getAllGroups.getProdutosComConcorrentesDinamico(
            req.query.grupoCodigo,
            req.query.italoBasesId
        );
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};