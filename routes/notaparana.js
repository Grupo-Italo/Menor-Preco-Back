const express = require('express');
const router = express.Router();
const notaParanaController = require('../controllers/notaParanaController');

router.get('/search', notaParanaController.search);

module.exports = router;
