const mongoose = require('mongoose');

const ListSchema = new mongoose.Schema({
  name: { type: String, required: true },
  movies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

// Add a unique compound index for id + createdBy
ListSchema.index({ name: 1, movies: 1, createdBy: 1 }, { unique: true });

const List = mongoose.model('List', ListSchema);
module.exports = List;
