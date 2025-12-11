const getAllGroups = require('../models/italoGroupsModel');

exports.getAllGroups = async (req, res) => {
    try {
        const groups = await getAllGroups.getAllGroups();
        res.json(groups);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};