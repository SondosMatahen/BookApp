'use strict'

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');
const app = express();
const methodOverride = require('method-override')

app.set('view engine', 'ejs');


const PORT = process.env.PORT || 3000;

const client = new pg.Client(process.env.DATABASE_URL);

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'))
app.use(express.static('./public'))







//------------routes---------

app.get('/', hadelHome);

app.get('/books/:book_id', handelSelectBook);

app.post('/searches', hadnelSearch)

app.post('/books', hadeladd);

app.put('/books/:book_id', handelUpdate)

app.delete('/books/:book_id', handelDelete)

app.get('/search/new', (req, res) => {
  res.render('pages/searches/new');
});

app.get('/update/:book_id', handelupdateGET);



//-----------Functions---------------

function handelupdateGET(req, res) {

  let SQL = 'select * from books where id=$1';
  let id = [req.params.book_id];
  let sql = 'select DISTINCT bookshelf from books;';

  console.log(id);
  return client.query(SQL, id)
    .then(results => {

      client.query(sql).then(data => {
        // console.log(data.rows)
        console.log(results.rows)

        res.render('pages/books/edit', { result: results.rows[0], bookshelf: data.rows })

      })
    })
    .catch(error => {
      close.log(error);
      res.render('pages/error');
    })

}




function hadelHome(req, res) {

  let SQL = 'select * from books;';

  return client.query(SQL)
    .then(results => {
      console.log(results.rowCount)
      res.render('pages/index', { books: results.rows, bookCount: results.rowCount })
    })
    .catch(err => handleError(err, response));


}



function handelSelectBook(req, res) {

  let SQL = 'select * from books where id=$1;';
  let id = [req.params.book_id];

  console.log(id);
  return client.query(SQL, id)
    .then(results => {
       console.log(results.rows)
      res.render('pages/books/show', { result: results.rows[0] })
    })
    .catch(error => {
      close.log(error);
      res.render('pages/error');
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
      close.log(error);
      res.render('pages/error');
    })

}





function hadeladd(req, res) {

  // console.log(req.body);
  let { author, title, isbn, image_url, description, bookshelf } = req.body;
  const SQL = 'INSERT INTO books (author,title,isban,image_url,description,bookshelf) VALUES ($1, $2, $3, $4, $5, $6);';
  let values = [author, title, isbn, image_url, description, bookshelf];
  let sql = 'select * from books;';
  let bookCount;


  client.query(sql)
    .then(results => {
      // console.log(results.rowCount)
      bookCount = results.rowCount
      // console.log(bookCount)
    })

  return client.query(SQL, values)
    .then(() => {

      res.redirect(`/books/${bookCount + 1}`)
    })
    .catch(error => {
      close.log(error);
      res.render('pages/error');
    })


}




function handelUpdate(req, res) {

  let SQL = 'update books set  author=$1 , title=$2 , isban=$3 , image_url=$4 , description=$5 , bookshelf=$6  where id=$7;';

  let { author, title, isbn, image_url, description, bookshelf } = req.body;
  let id = req.params.book_id;
  let values = [author, title, isbn, image_url, description, bookshelf, id];
  // console.log(values)


  return client.query(SQL, values)
    .then(() => {

      res.redirect(`/books/${id}`)
    })
    .catch(error => {
      close.log(error);
      res.render('pages/error');
    })
}



function handelDelete(req, res) {

  let SQL = 'delete from books where id=$1;';
  let id = [req.params.book_id];
  console.log(id)

  return client.query(SQL, id)
    .then(() => {

      res.redirect(`/`)
    })
    .catch(error => {
      close.log(error);
      res.render('pages/error');
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

client.connect().then(() => {
  app.listen(PORT, () => {
    console.log(`listening to port ${PORT}`);
  });

})