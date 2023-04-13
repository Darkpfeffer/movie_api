const jwtSecret= 'your_jwt_secret', // Has to be the same key like in JWTStrategy
    express= require('express'),
    bodyParser= require('body-parser');
    
const app= express();

// use of body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const jwt= require('jsonwebtoken'),
    passport= require('passport');

require('./passport') // linked local passport file

let generateJWTToken= (user) => {
    return jwt.sign(user, jwtSecret, {
        subject: user.Username, //the username you're encoding
        expiresIn: '7d', // When the token will expire
        algorithm: 'HS256' // this algorithm used to encode the values of JWT
    });
}

// POST login.
module.exports= (router) => {
    router.post('/login', (req, res) => {
        passport.authenticate('local', {session: false}, (error, user, info) => {
            if (error || !req.body.Username) {
                return res.status(400).json({
                    message: 'Something is not right: '+ error
                });
            }
            req.login(user, {session: false}, (error) => {
                if (error) {
                    res.send(error);
                }
                let token= generateJWTToken(user.toJSON());
                return res.json({ message:"Successful login" ,token });
            });
        })(req, res);
    });
}