const express = require('express'),
    morgan = require('morgan');
const app = express();

let topMovies = [
  {
    title: 'Jurassic Park',
    director: 'Steven Spielberg'
  },
  {
    title: 'Lord of the Rings',
    director: 'Peter Jackson'
  },
  {
    title: 'Avatar',
    director: 'James Cameron'
  },
  {
    title: 'Star Wars',
    director: 'George Lucas'
  },
  {
    title: 'The Godfather',
    director: 'Francis Ford Coppola'
  },
  {
    title: 'The Dark Knight',
    director: 'Christopher Nolan'
  },
  {
    title: 'Fight Club',
    director: 'David Fincher'
  },
  {
    title: 'Pulp Fiction',
    director: 'Quentin Tarantino'
  },
  {
    title: 'Psycho',
    director: 'Alfred Hitchcock'
  },
  {
    title: 'Goodfellas',
    director: 'Martin Scorsese'
  },  
];

// GET requests

app.use(express.static('public'));
app.use(morgan('common'));

app.get('/', (req, res) => {
  res.send('Welcome to my movie app!');
});

app.get('/documentation', (req, res) => {                  
  res.sendFile('public/documentation.html', { root: __dirname });
});

app.get('/movies', (req, res) => {
  res.json(topMovies);
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something is not working, oops!');
});


// listen for requests
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});