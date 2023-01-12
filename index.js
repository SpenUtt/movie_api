const express = require('express'),
      fs = require("fs"),
      path = require("path"),
      morgan = require('morgan');
const app = express();

// Middlewares
app.use(express.static('public'));
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), { flags: 'a' })
app.use(morgan('common', {
    stream: accessLogStream
}));

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

app.get('/', (req, res) => {
  res.send('Welcome to my movie app!!!');
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

//get all movies 
app.get('/movies', (req, res) => {
  res.send('GET request - successfully returning data on all movies');
});

//Express Code
//return data on movies 
app.get('/movies/:details', (req, res) => {
  res.send('GET request - successfully returning details on selected movie');
});

//return data about genre
app.get('/movies/genre/:details', (req, res) => {
  res.send('successful GET request - returning details on genre');
});

//return data about director
app.get('/movies/director/:details', (req, res) => {
  res.send('GET request - returning details on genre');
});

//allow new users to register
app.post('/users', (req, res) => {
  res.send('POST request - user successfully registered');
});

//allow users to update their user info
app.put('/users/:details', (req, res) => {
  res.send('PUT request - user info successfully updated');
});

//allow users to add movie to favorites 
app.post('/users/:favorites/:details', (req, res) => {
  res.send('POST request - item successfully added to favorites list');
});

//allow users to remove movie from favorite list
app.put('/users/:favorites/:details', (req, res) => {
  res.send('PUT request - item successfully removed from favorites list');
});

//allow users to deregsiter
app.delete('/users/:details/:deregister', (req, res) => {
  res.send('DELETE request - user successfully deregistered');
});

// listen for requests
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});