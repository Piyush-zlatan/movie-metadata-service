const express = require('express');
const router = express.Router();

const movieController = require('../controllers/movieController');

router.get('/movies/:id',movieController.getMovie);

module.exports = router;