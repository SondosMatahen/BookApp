'use strict'

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');
const app = express();

app.set('view engine', 'ejs');


const PORT = process.env.PORT || 3000;

const client = new pg.Client(process.env.DATABASE_URL);

app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('./public'))

client.connect().then(() => {
  app.listen(PORT, () => {
    console.log(`listening to port ${PORT}`);
  });

})


//------------routes---------

app.get('/', hadelHome);

app.get('/books/:book_id', handelSelectBook);

app.post('/searches', hadnelSearch)


app.get('/search/new', (req, res) => {
  res.render('pages/searches/new');
});


app.post('/books', hadeladd);




function hadelHome(req, res) {

  let SQL = 'select * from books;';

  return client.query(SQL)
    .then(results => {
      console.log(results.rowCount)
      res.render('pages/index', { books: results.rows, bookCount: results.rowCount })
    })
  // .catch(err => handleError(err, response));

}



function handelSelectBook(req, res) {

  let SQL = 'select * from books where id=$1;';
  let id = [req.params.book_id];

  // console.log(id);
  return client.query(SQL, id)
    .then(results => {

      res.render('pages/books/show', { result: results.rows[0] })
    })

}




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

  let url = `https://www.googleapis.com/books/v1/volumes?q=+${terms}:${input}`
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





function hadeladd(req, res) {

  // console.log(req.body);
  let { author, title, isbn, image_url, description, bookshelf } = req.body;
  const SQL = 'INSERT INTO books (author,title,isban,image_url,description,bookshelf) VALUES ($1, $2, $3, $4, $5, $6);';
  let values = [author, title, isbn,  image_url, description, bookshelf];
  let sql = 'select * from books;';
  let bookCount;


  client.query(sql)
    .then(results => {
      console.log(results.rowCount)
      bookCount = results.rowCount
      console.log(bookCount)
    })

  return client.query(SQL,values)
  .then(()=>{

        res.redirect(`/books/${bookCount+1}`)
       })


}








let image = `https://i.imgur.com/J5LVHEL.jpg`
let reg = /https?/gi;

//-----constructor function-----
function Book(data) {
  // this.img = (data.volumeInfo.imageLinks && data.volumeInfo.imageLinks.thumbnail.replace(reg, 'https')) || image;
  this.img = data.volumeInfo.imageLinks ? data.volumeInfo.imageLinks.thumbnail.replace(reg, 'https') : image;
  this.title = data.volumeInfo.title || 'N/A';
  this.authors = data.volumeInfo.authors || 'N/A';
  this.description = data.volumeInfo.description ? data.volumeInfo.description : 'No Description';
  this.isbn = data.volumeInfo.industryIdentifiers && data.volumeInfo.industryIdentifiers[0].identifier || 'N/A';
  this.bookshelf = data.volumeInfo.categories || 'N/A';
}



//-----listening to port------
app.listen(PORT, () => {
  console.log(`listening to port ${PORT}`);
});


