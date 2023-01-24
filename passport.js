const passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy, 
    Models = require('./models.js'),
    passportJWT = require('passport-jwt');

let Users = Models.User, 
    JWTStrategy = passportJWT.Strategy, 
    ExtractJWT = passportJWT.ExtractJWT; 

passport.use(new LocalStrategy({
    usernameField: 'Username',
    passwordField: 'Password'
}, (username, password, callback) => {
    console.log(username + '  ' + password);
    Users.findOne({ Username: username }, (error, user) => {
        if (error) {
        console.log(error);
        return callback(error);
        }
    
        if (!user) {
        console.log('incorrect username');
        return callback(null, false, {message: 'Incorrect username or password.'});
        }
    
        console.log('finished');
        return callback(null, user);
    });
}));

passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'your_jwt_secret'
}, (jwtPayload, callback) => {
    return Users.findById(jwtPayload._id)
        .then((user) => {
        return callback(null, user);
    })
        .catch((error) => {
        return callback(error)
    });
}));

//code for creating login endpoints

const jwtSecret = 'your_jwt_secret';
const jwt = require('jsonwebtoken'),
    passport = require('passport');

require('./passport'); 

let generateJWTToken = (user) => {
    return jwt.sign(user, jwtSecret, {
        subject: user.Username, 
        expiresIn: '7d', //indicates 7 day expiration
        algorithm: 'HS256' 
    });
}

// POST login
module.exports = (router) => {
    router.post('/login', (req, res) => {
        passport.authenticate('local', { session: false }, (error, user, info) => {
            if (error || !user) {
                return res.status(400).json({
                    message: 'Something is not right',
                    user: user
                });
            }
            req.login(user, { session: false }, (error) => {
                if (error) {
                    res.send(error);
                }
                let token = generateJWTToken(user.toJSON());
                return res.json({ user, token }); //returns token ES6; shorthand for res.json({ user: user, token: token })
            });
        })(req, res);
    });
}