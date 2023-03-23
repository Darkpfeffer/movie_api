const mongoose= require('mongoose');
const bcrypt= require('bcrypt');

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

userSchema.statics.hashPassword = (password) => {
    return bcrypt.hashSync(password, 10);
};

userSchema.methods.validatePassword= function(password) {
    return bcrypt.hashSync(password, 10)
};

let Movie= mongoose.model('Movie', movieSchema);
let User= mongoose.model('User', userSchema);

module.exports.Movie= Movie;
module.exports.User= User;