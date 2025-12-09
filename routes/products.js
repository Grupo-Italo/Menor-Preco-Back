const express = require('express');
const router = express.Router();
const productsController = require('../controllers/productsController');

router.get('/all', productsController.getProducts);
router.post('/bulk', productsController.createOrUpdateProductsBulk);

module.exports = router;
