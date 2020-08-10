'use strict'

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const app = express();

app.set('view engine', 'ejs');

app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('./public'))

const PORT = process.env.PORT || 3000;



//------------routes---------

app.get('/', (req, res) => {
  res.render('pages/index');
});


app.get('/hello', (req, res) => {
  res.render('pages/index');
});

app.get('/search/new', (req, res) => {
  res.render('pages/searches/new');
});

app.post('/searches', hadnelSearch)



function hadnelSearch(req, res) {
  let input = req.body.input;
  let searchBy = req.body.search;
  let terms;

  if (searchBy == 'title') {
    terms = 'intitle'
  }
  else {
    terms = 'inauthor'
  }


  let url = `https://www.googleapis.com/books/v1/volumes?q=${input}+${terms}:${input}`
  console.log(url)

  // console.log('qs :', input);
  // console.log('s :', searchBy);
  // console.log('POST request: ', req.body);
  // console.log(req.body);


  superagent.get(url)
  .then(data => {
    let arr = data.body.items.map(e => {
      let newbook = new Book(e);
      return newbook;
    })
   
    // console.log(arr)
    res.render('pages/searches/show', { list: arr })
  })
  .catch(error => {
    // console.log(error);
    res.render('pages/error');
  })

}





let image = `https://i.imgur.com/J5LVHEL.jpg`
let reg = /https?/gi;

//-----constructor function-----
function Book(data) {
  // this.img = (data.volumeInfo.imageLinks && data.volumeInfo.imageLinks.thumbnail.replace(reg, 'https')) || image;
  this.img = data.volumeInfo.imageLinks ? data.volumeInfo.imageLinks.thumbnail.replace(reg, 'https') : image;
  this.title = data.volumeInfo.title;
  this.authors = data.volumeInfo.authors;
  this.description = data.volumeInfo.description ? data.volumeInfo.description : 'No Description';

}



//-----listening to port------
app.listen(PORT, () => {
  console.log(`listening to port ${PORT}`);
});


