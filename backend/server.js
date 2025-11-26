const express = require('express');
const app = express();
const path = require('path');

app.use(express.static(path.join(__dirname, '../frontend')));

app.get("/",(req,res)=>{
    console.log("GET RESPOSNSE")
    res.json({message: "Hello from server"})}
)

app.listen(3000, ()=>{console.log("Server started on port 3000")})

const coinsRouter = require('./routes/coins');
app.use('/coins', coinsRouter);

//app.put
//app.post










//FILE TO FETCH COINS FROM EXTERNAL API AND SEND TO FRONTEND