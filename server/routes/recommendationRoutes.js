
const express = require('express');

const router = express.Router();

const {
    getRecommendations
} = require('../controllers/recommendationController');

// Get similar food recommendations
router.get('/:id', getRecommendations);

module.exports = router;
