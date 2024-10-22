const express = require("express");
const path = require ("path")
const routes = require("./routes");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname,"../client/dist")))

// app.get("*",(req,res)=>{
//     res.sendFile(path.join(__dirname,"../client/dist/index.html"))
// })


app.use('/api',routes)
module.exports = app
