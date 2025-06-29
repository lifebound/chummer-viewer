// Basic character model for MongoDB
const mongoose = require('mongoose');

const CharacterSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  data: { type: Object, required: true }, // The full character JSON
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Character', CharacterSchema);
