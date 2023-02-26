const express= require("express");
const app= express();

let myTopMovies= [
    {
        position: "1st",
        title: "The Lord of the Rings: The Fellowship of hte Ring",
        releaseDate: "2001",
        director: "Peter Jackson"
    },
    {
        position: "2nd",
        title: "The Lord of the Rings: The Two Towers",
        releaseDate: "2002",
        director: "Peter Jackson"
    },
    {
        position: "3rd",
        title: "The Lord of the Rings: The Return of the King",
        releaseDate: "2003",
        director: "Peter Jackson"
    },
    {
        position: "4th",
        title: "The Matrix",
        releaseDate: "1999",
        director: "The Wachowskis"
    },
    {
        position: "5th",
        title: "The Karate Kid",
        releaseDate: "2010",
        director: "Harald Zwart"
    },
    {
        position: "6th",
        title: "The Notebook",
        releaseDate: "2004",
        director: "Nick Cassavetes"
    },
    {
        position: "7th",
        title: "Prince of Persia: The Sands of Time",
        releaseDate: "2010",
        director: "Mike Newell"
    },
    {
        position: "8th",
        title: "Inception",
        releaseDate: "2010",
        director: "Christopher Nolan"
    },
    {
        position: "9th",
        title: "Hitman",
        releaseDate: "2007",
        director: "Xavier Gens"
    },
    {
        position: "10th",
        title: "The Matrix Reloaded",
        releaseDate: "2003",
        director: "The Wachowskis"
    }
]