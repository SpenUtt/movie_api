const express = require('express'),
      fs = require("fs"),
      path = require("path"),
      morgan = require('morgan'),
      bodyParser = require('body-parser'),
      uuid = require('uuid');
const app = express();

// Middlewares
app.use(express.static('public'));

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), { flags: 'a' })
app.use(morgan('common', {
    stream: accessLogStream
}));

app.use(bodyParser.json());

let topMovies = [
  {
    title: 'Jurassic Park',
    // commented section to be copied for next task 
    //imageUrl: "https://filmspiegel-essen.de/wp-content/uploads/2020/07/JurassicPark_plakat2.jpg",
    //description: "to be added",
    director: {
      name: 'Steven Spielberg',
    },
    genre: {
      name: 'to be added'
    },
  },
  {
    title: 'Lord of the Rings',
    director: {
      name: 'Peter Jackson',
    },
    genre: {
      name: 'adventure'
    },
  },
  {
    title: 'Avatar',
    director: {
      name: 'James Cameron',
    },
    genre: {
      name: 'to be added'
    },
  },
  {
    title: 'Star Wars',
    director: {
      name: 'George Lucas',
    },
    genre: {
      name: 'to be added'
    },
  },
  {
    title: 'The Godfather',
    director: {
      name: 'Francis Ford Coppola',
    },
    genre: {
      name: 'to be added'
    },
  },
  {
    title: 'The Dark Knight',
    director: {
      name: 'Christopher Nolan',
    },
    genre: {
      name: 'to be added'
    },
  },
  {
    title: 'Fight Club',
    director: {
      name: 'David Fincher',
    },
    genre: {
      name: 'to be added'
    },
  },
  {
    title: 'Pulp Fiction',
    director: {
      name: 'Quentin Tarantino',
    },
    genre: {
      name: 'to be added'
    },
  },
  {
    title: 'Psycho',
    director: {
      name: 'Alfred Hitchcock',
    },
    genre: {
      name: 'to be added'
    },
  },
  {
    title: 'Goodfellas',
    director: { 
      name: 'Martin Scorsese'
    },
    genre: {
      name: 'to be added'
    },
  },  
];

let users = [

];

// GET requests
// 200 - For successfull GET
// 201 - For successful create/update on server
// 404 - Not found
// 400 - Bad request

app.get('/', (req, res) => {
  res.send('Welcome to my movie app!!!');
});

app.get('/documentation', (req, res) => {                  
  res.sendFile('public/documentation.html', { root: __dirname });
});

//get all movies 
app.get('/movies', (req, res) => {
  res.status(200).json(topMovies);
});

//Express Code
//return data on movies by title 
app.get('/movies/:title', (req, res) => {
  const title = req.params.title;
  const result = topMovies.find(m => m.title === title)
  if (result) {
    return res.status(200).send(result);
  }
  return res.status(404).send("Movie you are looking for is not found!")
});

//return data about genre
app.get('/movies/genre/:genreName', (req, res) => {
  const genre = req.params.genreName;
  const result = topMovies.filter(m => m.genre.name === genre)
  if (result) {
    return res.status(200).send(result);
  }
  return res.status(404).send("No Movies with the given genre!")
});

//return data about director
app.get('/movies/director/:directorName', (req, res) => {
  res.send('GET request - returning details on director');
});

//allow new users to register
app.post('/users', (req, res) => {
  res.send('POST request - user successfully registered');
});

//allow users to update their user info
app.put('/users/:id', (req, res) => {
  res.send('PUT request - user info successfully updated');
});

//allow users to add movie to favorites 
app.post('/users/:id/favorites/:movieName', (req, res) => {
  res.send('POST request - item successfully added to favorites list');
});

//allow users to remove movie from favorite list
app.put('/users/:id/favorites/:movieName', (req, res) => {
  res.send('PUT request - item successfully removed from favorites list');
});

//allow users to deregsiter
app.delete('/users/:id/', (req, res) => {
  res.send('DELETE request - user successfully deregistered');
});

//Error 
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something is not working, oops!');
});

// listen for requests
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});