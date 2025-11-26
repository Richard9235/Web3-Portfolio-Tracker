//Endpoints for user portfolio 

const express = require('express');
const router = express.Router();

// Example endpoint to get full portfolio list
router.get('/portfolio', (req, res) => {
    
});

// Example endpoint to add token to portfolio list
router.post('/portfolio', (req, res) => {
});


// Example endpoint to delete token from portfolio list
router.delete('/portfolio/:symbol', (req, res) => {
});

module.exports = router;