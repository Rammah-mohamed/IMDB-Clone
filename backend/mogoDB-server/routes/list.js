const express = require('express');
const Movie = require('../models/Movie');
const List = require('../models/List');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// Create List
router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, movies } = req.body;

    // Validate input
    if (!name || !movies || !Array.isArray(movies)) {
      return res.status(400).send('Invalid input. "name" and "movies" are required.');
    }

    // Find movies by custom numeric IDs
    const movieDocs = await Movie.find({ id: { $in: movies }, createdBy: req.session.userId });

    // Check if all requested movies were found
    if (movieDocs.length !== movies.length) {
      return res.status(404).send('Some movies not found.');
    }

    // Extract _id values for the list
    const movieIds = movieDocs.map((movie) => movie._id);

    // Create the new list
    const list = new List({
      name,
      movies: movieIds, // Save ObjectIds in the list
      createdBy: req.session.userId,
    });

    await list.save();
    res.status(201).send('List created successfully.');
  } catch (err) {
    if (err.code === 11000) {
      // Duplicate key error
      return res.status(400).send('You have already added this movie.');
    }
    console.error(err);
    res.status(500).send('Error creating list.');
  }
});

// Update List
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const list = await List.findById(id);

    if (!list || list.createdBy.toString() !== req.session.userId) {
      return res.status(403).send('Not authorized.');
    }

    Object.assign(list, req.body);
    await list.save();
    res.send('List updated.');
  } catch (err) {
    res.status(500).send('Error updating list.');
  }
});

// Delete List
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const list = await List.findOne(id);

    // Check if movie exists
    if (!list) {
      return res.status(404).send('Movie not found.');
    }

    if (!list || list.createdBy.toString() !== req.session.userId) {
      return res.status(403).send('Not authorized.');
    }

    // Delete the movie
    await list.deleteOne();
    res.send('List deleted successfully.');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting list.');
  }
});

module.exports = router;
