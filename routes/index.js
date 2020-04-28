const express = require('express');
const router = express.Router();

const movieController = require('../controllers/movieController');

router.get('/movies/:id',movieController.getMovie);

router.get('/movies/',movieController.searchMovie);

module.exports = router;