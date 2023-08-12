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

/** @function Login 
 * @summary Logs a user in to the website/application
 *  - Endpoint URL: '/login' 
 *  - Method type: 'POST'
 * 
 * Expected request body (JSON):
 * {
 *  Username: String,
 *  Password: String
 * }
 * - Response data: JSON
 *  - After login, user the 'token' in the HTML header 'Authentication: Bearer ${token}
 * @example Request: 
 * {
 *  Username: Mary,
 *  Password: "example456!
 * }
 * 
 * @example Response:
 * {
 * "user": { "_id": "641309dbd3d6abe814c76a1c", "Username": "Mary", "Password": "$2b$10$Qzj0VgzghovcMDB1c7QyU.w39n2jAMH6rw6FRzZLeeX4WArti2OO2", "Email": "mary@example.com", "Birthday": "2001-10-24T00:00:00.000Z", "FavoriteMovies": [], "__v": 0 },
 * "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NDEzMDlkYmQzZDZhYmU4MTRjNzZhMWMiLCJVc2VybmFtZSI6Ik1hcnkiLCJQYXNzd29yZCI6ImV4YW1wbGU0NTYhIiwiRW1haWwiOiJtYXJ5QGV4YW1wbGUuY29tIiwiQmlydGhkYXkiOiIyMDAxLTEwLTI0VDAwOjAwOjAwLjAwMFoiLCJGYXZvcml0ZU1vdmllcyI6W10sIl9fdiI6MCwiaWF0IjoxNjc5NDc3OTYxLCJleHAiOjE2ODAwODI3NjEsInN1YiI6Ik1hcnkifQ.B82SgvK_MCxE3QENmiVU4E9YZpipc_uHkBUDDmH1hjQ"
 * }
 * */ 
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
                    return res.status(400).json({
                        message: 'Something is not right: '+ error
                    })
                }
                let token= generateJWTToken(user.toJSON());
                return res.json({ message:"Successful login", user ,token });
            });
        })(req, res);
    });
}