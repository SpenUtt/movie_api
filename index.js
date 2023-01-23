const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;
mongoose.connect('mongodb://localhost:27017/MyMovieApp', { useNewUrlParser: true, useUnifiedTopology: true });

const express = require('express'), //should these lines be removed with mongoose integration? 
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
//should the following two arrays be removed? 
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
  res.send('Welcome to MyMovieApp!!!');
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
// commented out from previous task to transition to mongoose 
//app.post('/users', (req, res) => {
//  res.send('POST request - user successfully registered');
//});

//Add a user
app.post('/users', (req, res) => {
  Users.findOne({ Username: req.body.Username })
  .then((user) => {
    if (user) {
      return res.status(400).send(req.body.Username + 'already exists');
    } else {
      Users
        .create({
          Username: req.body.Username,
          Password: req.body.Password,
          Email: req.body.Email,
          Birthday: req.body.Birthday
        })
        .then((user) =>{res.status(201).json(user) })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      })
    }
  })
  .catch((error) => {
    console.error(error);
    res.status(500).send('Error: ' + error);
  });
});

// Get all users
app.get('/users', (req, res) => {
  Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Get a user by username
app.get('/users/:Username', (req, res) => {
  Users.findOne({ Username: req.params.Username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//allow users to update their user info
// old code, to be removed? 
//app.put('/users/:id', (req, res) => {
//  res.send('PUT request - user info successfully updated');
//});

app.put('/users/:Username', (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
    {
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
  { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if(err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

//allow users to add movie to favorites 
//old code to be removed 
//app.post('/users/:id/favorites/:movieName', (req, res) => {
//  res.send('POST request - item successfully added to favorites list');
//});

app.post('/users/:Username/movies/:MovieID', (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
     $push: { FavoriteMovies: req.params.MovieID }
  },
  { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

//allow users to remove movie from favorite list
//old code to be removed 
//app.put('/users/:id/favorites/:movieName', (req, res) => {
//  res.send('PUT request - item successfully removed from favorites list');
//});
app.post('/users/:Username/movies/:MovieID', (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
     $pull: { FavoriteMovies: req.params.MovieID }
  },
  { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
}); //where should app.delete be used to remove the data about movie favorites? 


//allow users to deregsiter
//old code to be removed 
//app.delete('/users/:id/', (req, res) => {
//  res.send('DELETE request - user successfully deregistered');
//});

app.delete('/users/:Username', (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
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