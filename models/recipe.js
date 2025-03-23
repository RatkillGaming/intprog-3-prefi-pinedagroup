// models/Recipe.js
const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  id: String,
  name: String,
  image: String,
  ingredients: String,
  instructions: String // Add instructions field to schema
});

const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;