const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const mongoose = require('mongoose');
const Recipe = require('./models/recipe');

const app = express();
const PORT = 3000;

//=========================================================================================================MONGODB CONNECT
mongoose.connect('mongodb://localhost:27017/recipes', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

app.use(bodyParser.json());

//=========================================================================================================STATIC FILE NEED
app.use(express.static(__dirname));

//=========================================================================================================GOES TO INDEX
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

//=========================================================================================================API BASTA KANA AHAK OI POYA HAHAHA
app.get('/recipes', async (req, res) => {
  try {
    const response = await axios.get('https://www.themealdb.com/api/json/v1/1/search.php?s=');
    console.log('API Response Data:', response.data);
    const recipes = response.data.meals;
    console.log('Mapped Recipe Objects:', recipes);
    const updatedRecipes = recipes.map(recipe => ({
      id: recipe.idMeal,
      name: recipe.strMeal,
      image: recipe.strMealThumb ? recipe.strMealThumb : 'https://via.placeholder.com/100', 
      ingredients: [
        recipe.strIngredient1,
        recipe.strIngredient2,
        recipe.strIngredient3,
        recipe.strIngredient4,
        recipe.strIngredient5,
        recipe.strIngredient6,
        recipe.strIngredient7,
        recipe.strIngredient8,
        recipe.strIngredient9,
        recipe.strIngredient10,
        recipe.strIngredient11,
        recipe.strIngredient12,
        recipe.strIngredient13,
        recipe.strIngredient14,
        recipe.strIngredient15,
        recipe.strIngredient16,
        recipe.strIngredient17,
        recipe.strIngredient18,
        recipe.strIngredient19,
        recipe.strIngredient20,
      ].filter(ingredient => ingredient !== '' && ingredient !== null).join(', '),
      instructions: recipe.strInstructions 
    }));
    //=========================================================================================================RSPONDS BACK TO ME
    res.json(updatedRecipes);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching recipes');
  }
});

//=========================================================================================================RECIPE TO BE SHOWN BY NAME
app.get('/search-recipes', async (req, res) => {
  try {
    const { query } = req.query;
    const response = await axios.get(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error searching recipes:', error);
    res.status(500).send('Error searching recipes');
  }
});

//=========================================================================================================RECIPE SAVE TO MONGO
app.post('/save-recipe', async (req, res) => {
  try {
    const { id, name, image, ingredients, instructions } = req.body;
    const newRecipe = new Recipe({ id, name, image, ingredients, instructions });
    await newRecipe.save();
    res.status(201).send('Recipe saved!');
  } catch (error) {
    console.error('Error saving recipe:', error);
    res.status(500).send('Error saving recipe');
  }
});

//=========================================================================================================RFECIPE UNSAVE FROM MONGO
app.delete('/unsave-recipe/:id', async (req, res) => {
  try {
    const id = req.params.id;
    console.log('Attempting to unsave recipe with ID:', id);

    const result = await Recipe.findOneAndDelete({ id: id });
    if (!result) {
      console.log('Recipe not found with ID:', id);
      return res.status(404).send({ message: 'Recipe not found' });
    }

    console.log('Recipe unsaved successfully:', result);
    res.status(200).send({ message: 'Recipe unsaved!', data: result });
  } catch (error) {
    console.error('Error unsaving recipe:', error);
    res.status(500).send({ message: 'Error unsaving recipe', error: error.message });                                                                                                                                                         //pineda 23222516
  }
});

//=========================================================================================================VIEW SAVED RECIPES
app.get('/saved-recipes', async (req, res) => {
  try {
    const recipes = await Recipe.find();
    res.json(recipes);
  } catch (error) {
    console.error('Error fetching saved recipes:', error);
    res.status(500).send('Error fetching saved recipes');
  }
});

//=========================================================================================================ENGINE START
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});