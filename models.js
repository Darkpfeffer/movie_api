const mongoose= require('mongoose');

// Schema for movies
let movieSchema= mongoose.Schema({
    Title: {type: String, required: true},
    Description: {type: String, required: true},
    Genre: {
        Name: {type: String, required: true},
        Description: {type: String, required: true}
    },
    Director: {
        Name: {type: String, required: true},
        Bio: {type: String, required: true},
        Birthyear: {type: Number, required: true},
        Deathyear: Number
    },
    Actors: [String],
    ImagePath: {type: String, required: true}
});

// Schema for users
let userSchema= mongoose.Schema({
    Username: {type: String, required: true},
    Password: {type: String, required: true},
    Email: {type: String, required: true},
    Birthday: {type: Date, required: true},
    FavoriteMovies: [{type: mongoose.Schema.Types.ObjectId, red: 'Movie'}]
});

let Movie= mongoose.model('Movie', movieSchema);
let User= mongoose.model('User', userSchema);

module.exports.Movie= Movie;
module.exports.User= User;