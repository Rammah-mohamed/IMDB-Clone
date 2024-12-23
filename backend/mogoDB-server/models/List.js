const mongoose = require('mongoose');

// Define the MovieSchema
const MovieSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  title: String,
  name: String,
  overview: String,
  poster_path: String,
  backdrop_path: String,
  genre_ids: [Number],
  release_date: String,
  first_air_date: String,
  media_type: String,
  popularity: Number,
  vote_average: String,
  vote_count: String,
  isAdded: { type: Boolean, default: false },
  __typename: String,
  createdAt: { type: Date, default: Date.now },
});

// Define the ListSchema
const ListSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  movies: [
    {
      type: MovieSchema,
      required: true,
      validate: {
        validator: function (movies) {
          // Check for duplicate movie IDs in the list
          const ids = movies.map((movie) => movie.id);
          return ids.length === new Set(ids).size; // Ensure all IDs are unique
        },
        message: 'Duplicate movie IDs are not allowed in the list.',
      },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

// Add a unique compound index for name + createdBy
ListSchema.index({ name: 1, createdBy: 1 }, { unique: true });

// Middleware to check for duplicate movies on document save
ListSchema.pre('save', function (next) {
  const ids = this.movies.map((movie) => movie.id);
  if (ids.length !== new Set(ids).size) {
    return next(new Error('Duplicate movie IDs are not allowed in the list.'));
  }
  next();
});

const List = mongoose.model('List', ListSchema);
module.exports = List;
