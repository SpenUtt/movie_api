const express = require('express'), 
      fs = require("fs"),
      path = require("path"),
      morgan = require('morgan'),
      bodyParser = require('body-parser'),
      uuid = require('uuid');
const app = express();

const mongoose = require('mongoose');
const Models = require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://127.0.0.1:27017/MyMovieApp');

app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));
let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');


// Middlewares
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), { flags: 'a' })
app.use(morgan('common', {
    stream: accessLogStream
}));
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send('Welcome to MyMovieApp!!!');
});

app.get('/documentation', (req, res) => {                  
  res.sendFile('public/documentation.html', { root: __dirname });
});

//get all movies 
app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.find({}).then(movies => {
    res.status(200).send(movies);
  }).catch(e => {
    console.error('Error getting movies from Database', e)
  })
});

//return data on movies by title 
app.get('/movies/:title', async (req, res) => {
  const title = req.params.title;
  const result = await Movies.findOne({Title: title})
  if (result) {
    return res.status(200).send(result);
  }
  return res.status(404).send("The movie you are looking for is not found!")
});

//return data about genre
app.get('/movies/genre/:genreName', (req, res) => {
  const genreName = req.params.genreName;
  Movies.find({"Genre.Name": genreName}).then(movies => {
    res.status(200).send(movies);
  }).catch(e => {
    console.error('Error getting movies by Genre Name from DB', e)
  })
});

//return data about director
app.get('/movies/director/:directorName', (req, res) => {
  const directorName = req.params.directorName;
  Movies.find({"Director.Name": directorName}).then(movies => {
    res.status(200).send(movies);
  }).catch(e => {
    console.error('Error getting movies by Director Name from DB', e)
  })
});

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
          Password: req.body.Password, // TODO: We should not save password just like this, instead we should HASH**** it
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
app.put('/users/:Username', (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
    {
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
  { new: true }, 
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
app.post('/users/:Username/movies/:MovieID', (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
     $push: { FavoriteMovies: req.params.MovieID }
  },
  { new: true }, 
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

//allow users to remove movie from favorites list
app.delete('/users/:Username/movies/:MovieID', (req, res) => {
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
}); 

//allow users to deregister
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