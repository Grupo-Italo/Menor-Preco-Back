const express = require('express');
const router = express.Router();
const italoGroupsController = require('../controllers/italoGroupsController');
const italoMarcasController = require('../controllers/italoMarcasController');

router.get('/groups', italoGroupsController.getAllGroups);
router.get('/brands', italoMarcasController.getAllBrands);

module.exports = router;
