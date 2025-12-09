const express = require('express');
const router = express.Router();
const italoBasesController = require('../controllers/italoBasesController');

router.get('/', italoBasesController.getBases);

module.exports = router;
