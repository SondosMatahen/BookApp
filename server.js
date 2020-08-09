'use strict'

require('dotenv').config();
const express=require('express');
const cors= require('cors');
const app = express();

app.set('view engine','ejs');

app.use(cors());
app.use(express.urlencoded({extended:true}));

app.use(express.static('./public'))

const PORT =process.env.PORT||3000;


app.get('/', (req,res)=>{
    res.render('./pages/index');
  });

  
app.get('/hello', (req,res)=>{
    res.render('./pages/index');
  });



app.listen(PORT,()=>{
    console.log(`listening to port ${PORT}`);
});