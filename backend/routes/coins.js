const express = require('express');
const router = express.Router();

router.get('/getBTC', async (req, res) => {
    try{
        const response = await fetch('https://api.coingecko.com/api/v3');
        const data = await response.json();
        res.json(data);
    }
    catch(err){
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.get('/price/:symbol', async (req, res) => {
    try{
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
        const data = await response.json();
        res.json(data);
    }
    catch(err){
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.post('/post/:symbol', async (req, res) => {
    try{
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
        const data = await response.json();
        res.json(data);
    }
    catch(err){
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});





module.exports = router;