/******************************************************************************
 ***
 * ITE5315 – Assignment 1
 * I declare that this assignment is my own work in accordance with Humber Academic Policy.
 * No part of this assignment has been copied manually or electronically from any other source
 * (including web sites) or distributed to other students.
 *
 * Name: Ramees Karolil Rasheed Student ID: N01632407 Date: 30th October 2024
 *
 *
 ******************************************************************************
 **/

// Import necessary modules
var express = require("express"); // Express framework
const fs = require("fs"); // Built-in file system module for reading and writing files
var path = require("path"); // Built-in path module for handling and transforming file paths
var app = express(); // Initialize the Express app
const exphbs = require("express-handlebars"); // Handlebars templating engine
const port = process.env.port || 3000; // Define server port
const { join } = require("path");

// Set up static directory for serving static files (e.g., stylesheets and images)
app.use(express.static(path.join(__dirname, "public")));
app.set("views", join(__dirname, "views"));

// Set up Handlebars as the view engine with the custom helper
app.engine(
  ".hbs",
  exphbs.engine({
    extname: ".hbs",
    helpers: {
      hasWebsite: function (website) {
        return (
          website &&
          website.trim() !== "" &&
          website.trim().toLowerCase() !== "na" &&
          website.trim().toLowerCase() !== "n/a"
        );
      },
      //custome helper to highlight rows without website (includes NA, N/A, na, n/a)
      highlightNoWebsite: function (website) {
        return (
          website &&
          website.trim() !== "" &&
          website.trim().toLowerCase() !== "na" &&
          website.trim().toLowerCase() !== "n/a"
        );
      },
    },
  })
);
app.set("view engine", "hbs");

// Serve JSON data
let movieData = [];
const filePath = path.join(__dirname, "data", "movie-dataset-new.json");
fs.readFile(filePath, "utf8", (err, data) => {
  if (err) {
    console.error("Error reading movie data:", err);
    return;
  }
  movieData = JSON.parse(data);
  console.log("Movie data loaded successfully");
});

// Set up routes
// Home route
app.get("/", function (req, res) {
  res.render("index", { title: "Assignment 2" });
});

// Route for loaded data
app.get("/data", (req, res) => {
  res.render("data", { title: "Movie Data", movies: movieData });
});

// Route for accessing a movie by index
app.get("/data/movie/:index", (req, res) => {
  const index = parseInt(req.params.index);
  if (index >= 0 && index < movieData.length) {
    const movie = movieData[index];
    res.render("movie", { title: movie.Title, movie });
  } else {
    res.status(404).render("error", {
      title: "404 Not Found",
      message: "The movie index does not exist.",
    });
  }
});

// Search by ID form
app.get("/data/search/id", (req, res) => {
  res.render("search_id", { title: "Search by Movie ID" });
});

app.get("/data/search/id/result", (req, res) => {
  const movieID = parseInt(req.query.movie_id);

  // Ensure movieData is loaded before attempting to use find()
  if (movieData) {
    const movie = movieData.find((m) => m.Movie_ID === movieID);
    if (movie) {
      const movieJson = JSON.stringify(movie, null, 2);
      res.render("search_id_result", {
        title: "Search Results",
        movie,
        movieJson,
      });
    } else {
      res.status(404).render("error", {
        title: "404 Not Found",
        message: "The movie ID does not exist.",
      });
    }
  } else {
    res.status(500).send("Error: Movie data not yet loaded.");
  }
});

// Search by title form
app.get("/data/search/title", (req, res) => {
  res.render("search_title", { title: "Search by Movie Title" });
});

// Search by title results
app.get("/data/search/title/result", (req, res) => {
  const searchTitle = req.query.movie_title.toLowerCase();
  const matchingMovies = movieData.filter((movie) =>
    movie.Title.toLowerCase().includes(searchTitle)
  );
  if (matchingMovies.length > 0) {
    res.render("search_title_result", {
      title: "Search Results",
      movies: matchingMovies,
    });
  } else {
    res.status(404).render("error", {
      title: "404 Not Found",
      message: "No movies found with the given title.",
    });
  }
});

app.get("/viewData", (req, res) => {
  res.render("viewData", { title: "Movie Sales Data", movies: movieData });
});

// Handle undefined routes
app.use((req, res) => {
  res.status(404).render("error", {
    title: "404 Not Found",
    message: "The page you are looking for does not exist.",
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
