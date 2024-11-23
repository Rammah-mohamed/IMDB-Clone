const mongoose = require('mongoose');

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
  __typename: String,
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

// Add a unique compound index for id + createdBy
MovieSchema.index({ id: 1, createdBy: 1 }, { unique: true });

const Movie = mongoose.model('Movie', MovieSchema);
module.exports = Movie;
