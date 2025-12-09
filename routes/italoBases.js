const express = require('express');
const router = express.Router();
const italoBasesController = require('../controllers/italoBasesController');

router.get('/cities', italoBasesController.getCities);
router.get('/bases', italoBasesController.getBases);

module.exports = router;
