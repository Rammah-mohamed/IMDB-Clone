const express = require('express');
const Movie = require('../models/Movie');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

//Get Movies
router.get('/', requireAuth, async (req, res) => {
  try {
    // Retrieve all movies created by the authenticated user
    const movies = await Movie.find({ createdBy: req.session.userId });
    res.status(200).json(movies);
  } catch (err) {
    console.error('Error fetching movies:', err);
    res.status(500).send('Error fetching movies.');
  }
});

// Add Movie
router.post('/', requireAuth, async (req, res) => {
  try {
    const {
      id,
      title,
      name,
      overview,
      poster_path,
      backdrop_path,
      genre_ids,
      release_date,
      first_air_date,
      media_type,
      popularity,
      vote_average,
      vote_count,
      __typename,
    } = req.body;

    const movie = new Movie({
      id,
      title,
      name,
      overview,
      poster_path,
      backdrop_path,
      genre_ids,
      release_date,
      first_air_date,
      media_type,
      popularity,
      vote_average,
      vote_count,
      __typename,
      createdBy: req.session.userId,
    });
    await movie.save();
    res.status(201).send('Movie added.');
  } catch (err) {
    if (err.code === 11000) {
      // Duplicate key error
      return res.status(400).send('You have already added this movie.');
    }
    console.error(err);
    res.status(500).send(err.message || 'Error adding movie.');
  }
});

// Delete Movie
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate that the ID is a number
    if (isNaN(id)) {
      return res.status(400).send('Invalid movie ID. It must be a number.');
    }

    const movie = await Movie.findOne({ id: Number(id) });

    // Check if movie exists
    if (!movie) {
      return res.status(404).send('Movie not found.');
    }

    // Check if the user is authorized to delete the movie
    const isAuthorized = await Movie.findOne({ id: Number(id), createdBy: req.session.userId });

    if (!isAuthorized) {
      return res.status(403).send('You are not authorized to delete this movie.');
    }

    // Delete the movie
    await movie.deleteOne();
    res.send('Movie deleted successfully.');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting movie.');
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params; // The movie ID from the URL
    // Validate that the ID is a number
    if (isNaN(id)) {
      return res.status(400).send('Invalid movie ID. It must be a number.');
    }

    const movie = await Movie.findOne({ id: Number(id) });

    if (!movie || movie.createdBy.toString() !== req.session.userId) {
      return res.status(403).send('Not authorized.'); // Ownership check
    }

    // Update movie details
    const updatedMovie = await Movie.findOneAndUpdate({ id: Number(id) }, req.body, {
      new: true, // Return the updated document
      runValidators: true, // Ensure validations are applied
    });

    res.status(200).json(updatedMovie); // Respond with the updated movie
  } catch (err) {
    console.error('Error updating movie:', err);
    res.status(500).send('Error updating movie.');
  }
});

module.exports = router;
