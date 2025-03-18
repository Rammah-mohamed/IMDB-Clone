const express = require("express");
const List = require("../models/List");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

//Get Lists
router.get("/", requireAuth, async (req, res) => {
  try {
    // Retrieve all lists created by the authenticated user
    const lists = await List.find({ createdBy: req.session.userId });
    res.status(200).json(lists);
  } catch (err) {
    console.error("Error fetching lists:", err);
    res.status(500).send("Error fetching lists.");
  }
});

//Get Lists
router.get("/:name", requireAuth, async (req, res) => {
  try {
    const { name } = req.params;
    const lists = await List.findOne({
      name: name.replaceAll("_", " "),
      createdBy: req.session.userId,
    });
    res.status(200).json(lists);
  } catch (err) {
    console.error("Error fetching lists:", err);
    res.status(500).send("Error fetching lists.");
  }
});

// Create List
router.post("/", requireAuth, async (req, res) => {
  try {
    const { name, description, movies } = req.body;

    // Validate input
    if (!name) {
      return res.status(400).send('Invalid input. "name" is required.');
    }

    // Create the new list
    const list = new List({
      name,
      description,
      movies,
      createdBy: req.session.userId,
    });

    await list.save();
    res.status(201).send("List created successfully.");
  } catch (err) {
    if (err.code === 11000) {
      // Duplicate key error
      return res.status(400).send("You have already added this list.");
    }
    console.error(err);
    res.status(500).send("Error creating list.");
  }
});

// Update List
router.put("/:name", requireAuth, async (req, res) => {
  try {
    const { name } = req.params;
    const list = await List.findOne({ name: name.replaceAll("_", " ") });

    if (!list || list.createdBy.toString() !== req.session.userId) {
      return res.status(403).send("Not authorized.");
    }

    Object.assign(list, req.body);
    await list.save();
    res.send("List updated.");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Update List Movie
router.put("/:name/:id", requireAuth, async (req, res) => {
  try {
    const { name, id } = req.params;
    const list = await List.findOne({ name: name.replaceAll("_", " ") });

    if (!list || list.createdBy.toString() !== req.session.userId) {
      return res.status(403).send("Not authorized.");
    }

    const movie = list?.movies?.find((m) => m?.id === Number(id));
    if (!movie) {
      Object.assign(list, {
        movies: [...list?.movies, req.body],
      });
    } else {
      const updatedMovie = list?.movies?.map((m) => (m?.id === Number(id) ? req.body : m));
      Object.assign(list, {
        movies: updatedMovie,
      });
    }

    await list.save();
    res.send("Movie updated.");
  } catch (err) {
    res.status(500).send("Error updating Movie.");
  }
});

// Delete List
router.delete("/:name", requireAuth, async (req, res) => {
  try {
    const { name } = req.params;

    const list = await List.findOne({ name: name.replaceAll("_", " ") });

    if (!list || list.createdBy.toString() !== req.session.userId) {
      return res.status(403).send("Not authorized.");
    }

    await list.deleteOne();
    res.send("List deleted successfully.");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting list.");
  }
});

// Delete movie
router.delete("/:name/:id", requireAuth, async (req, res) => {
  try {
    const { name, id } = req.params;

    if (isNaN(id)) {
      return res.status(403).send("The ID is not Vaild, Enter a number");
    }

    const list = await List.findOne({ name: name.replaceAll("_", " ") });

    if (!list || list.createdBy.toString() !== req.session.userId) {
      return res.status(403).send("Not authorized.");
    }

    const movie = list?.movies?.some((m) => m.id === Number(id));
    if (!movie) {
      return res.status(403).send("Movie Was not found");
    }

    Object.assign(list, {
      movies: list?.movies?.filter((m) => m.id !== Number(id)),
    });
    await list.save();
    res.send("Movie deleted successfully.");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting movie.");
  }
});

// Delete All Movies
router.delete("/:name/movies/all", requireAuth, async (req, res) => {
  try {
    const { name } = req.params;

    const list = await List.findOne({ name: name.replaceAll("_", " ") });

    if (!list || list.createdBy.toString() !== req.session.userId) {
      return res.status(403).send("Not authorized.");
    }

    Object.assign(list, {
      movies: [],
    });
    await list.save();
    res.send("All movies deleted successfully.");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting movies.");
  }
});

module.exports = router;
