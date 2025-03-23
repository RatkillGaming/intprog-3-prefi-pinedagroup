// Fetch and display recipes from the API
fetch('http://localhost:3000/recipes')
  .then((response) => response.json())
  .then((data) => {
    console.log('API response data:', data);
    const recipesDiv = document.getElementById('recipes');
    recipesDiv.innerHTML = ''; // Clear previous content

    if (data && data.length > 0) {
      // Fetch saved recipes to check which ones are already saved
      fetch('http://localhost:3000/saved-recipes')
        .then((response) => response.json())
        .then((savedRecipes) => {
          const savedRecipeIds = savedRecipes.map((recipe) => recipe.id); // Get IDs of saved recipes

          data.forEach((meal) => {
            const ingredients = meal.ingredients;
            const instructions = meal.instructions;

            const recipeElement = document.createElement('div');
            recipeElement.className = 'recipe-card w-full md:w-1/2 lg:w-1/4 xl:w-1/4 p-4';
            recipeElement.id = `recipe-${meal.id}`;
            recipeElement.innerHTML = `
              <h2>${meal.name}</h2>
              <img src="${meal.image}" alt="${meal.name}" style="width: 100px; height: 100px;">
              <p>Ingredients: ${ingredients}</p>
              <button class="save-button" data-id="${meal.id}" data-name="${meal.name}" data-image="${meal.image}" data-ingredients="${ingredients}" data-instructions="${instructions}" ${savedRecipeIds.includes(meal.id) ? 'style="display: none;"' : ''}>Save Recipe</button>
              <button class="unsave-button" data-id="${meal.id}" ${savedRecipeIds.includes(meal.id) ? '' : 'style="display: none;"'}>Unsave Recipe</button>
              <button class="view-instructions-button" data-id="${meal.id}" data-instructions="${instructions}">View Instructions</button>
            `;
            recipesDiv.appendChild(recipeElement);
          });
        })
        .catch((error) => console.error('Error fetching saved recipes:', error));
    } else {
      console.error('No meals found in API response data');
    }
  })
  .catch((error) => console.error(error));

// Function to save a recipe
function saveRecipe(button) {
    const id = button.getAttribute('data-id');
    const name = button.getAttribute('data-name');
    const image = button.getAttribute('data-image');
    const ingredients = button.getAttribute('data-ingredients');
    const instructions = button.getAttribute('data-instructions');
  
    const recipeData = {
      id: id,
      name: name,
      image: image,
      ingredients: ingredients,
      instructions: instructions,
    };
  
    fetch('/save-recipe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(recipeData),
    })
      .then((response) => response.text())
      .then((data) => {
        console.log('Recipe saved:', data);
  
        // Show a success pop-up message
        alert('Recipe saved successfully!');
  
        // Hide save button and show unsave button
        button.style.display = 'none';
        button.nextElementSibling.style.display = 'block';
  
        // Refresh the saved recipes list
        fetchSavedRecipes();
      })
      .catch((error) => {
        console.error('Error saving recipe:', error);
        alert('Error saving recipe: ' + error.message);
      });
  }

// Function to unsave a recipe
function unsaveRecipe(button) {
    const recipeId = button.getAttribute('data-id'); // Get the recipe ID from the button
  
    // Send a DELETE request to the backend to unsave the recipe
    fetch(`/unsave-recipe/${recipeId}`, { method: 'DELETE' })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to unsave recipe');
        }
        return response.json();
      })
      .then((data) => {
        console.log('Recipe unsaved successfully:', data);
  
        // Remove the recipe card from the saved recipes list
        const savedRecipeElement = document.getElementById(`saved-recipe-${recipeId}`);
        if (savedRecipeElement) {
          savedRecipeElement.remove();
        }
  
        // Update the save/unsave buttons in the main recipes list
        const saveButton = document.querySelector(`.save-button[data-id="${recipeId}"]`);
        const unsaveButton = document.querySelector(`.unsave-button[data-id="${recipeId}"]`);
  
        if (saveButton) {
          saveButton.style.display = 'block'; // Show the save button
        }
        if (unsaveButton) {
          unsaveButton.style.display = 'none'; // Hide the unsave button
        }
  
        // Optional: Show a success message
        alert('Recipe unsaved successfully!');
      })
      .catch((error) => {
        console.error('Error unsaving recipe:', error);
        alert('Error unsaving recipe: ' + error.message);
      });
  }

// Add event listeners to save and unsave buttons
document.addEventListener('click', (event) => {
  if (event.target.classList.contains('save-button')) {
    saveRecipe(event.target);
  } else if (event.target.classList.contains('unsave-button')) {
    unsaveRecipe(event.target);
  }
});

// Add event listener to view instructions button
document.addEventListener('click', (event) => {
  if (event.target.classList.contains('view-instructions-button')) {
    const recipeId = event.target.getAttribute('data-id');
    const instructions = event.target.getAttribute('data-instructions');

    // Display instructions in a modal
    const modal = document.getElementById('recipe-modal');
    const modalContent = modal.querySelector('.modal-content');
    modalContent.querySelector('#recipe-title').textContent = `Instructions for Recipe ${recipeId}`;
    modalContent.querySelector('#recipe-instructions').textContent = instructions;
    modal.style.display = 'block';
  }
});

// Add event listener to close modal window
document.addEventListener('click', (event) => {
  if (event.target.classList.contains('close')) {
    const modal = document.getElementById('recipe-modal');
    modal.style.display = 'none';
  }
});

// Function to fetch and display saved recipes
function fetchSavedRecipes() {
  fetch('http://localhost:3000/saved-recipes')
    .then((response) => response.json())
    .then((data) => {
      console.log('Saved recipes data:', data);
      const savedRecipesDiv = document.getElementById('saved-recipes');
      savedRecipesDiv.innerHTML = ''; // Clear previous content

      data.forEach((recipe) => {
        const savedRecipeElement = document.createElement('div');
        savedRecipeElement.className = 'saved-recipe-card w-full md:w-1/2 lg:w-1/4 xl:w-1/4 p-4';
        savedRecipeElement.id = `saved-recipe-${recipe.id}`;
        savedRecipeElement.innerHTML = `
          <h2>${recipe.name}</h2>
          <img src="${recipe.image}" alt="${recipe.name}">
          <p>Ingredients: ${recipe.ingredients}</p>
          <button class="unsave-button" data-id="${recipe.id}">Unsave Recipe</button>
          <button class="view-instructions-button" data-id="${recipe.id}" data-instructions="${recipe.instructions}">View Instructions</button>
        `;
        savedRecipesDiv.appendChild(savedRecipeElement);
      });
    })
    .catch((error) => console.error(error));
}

// Add event listener to view saved recipes button
document.getElementById('view-saved-recipes-button').addEventListener('click', () => {
  fetchSavedRecipes();
  document.getElementById('view-saved-recipes-button').style.display = 'none';
  document.getElementById('hide-saved-recipes-button').style.display = 'block';
});

// Add event listener to hide saved recipes button
document.getElementById('hide-saved-recipes-button').addEventListener('click', () => {
  const savedRecipesDiv = document.getElementById('saved-recipes');
  savedRecipesDiv.innerHTML = ''; // Clear previous content
  document.getElementById('view-saved-recipes-button').style.display = 'block';
  document.getElementById('hide-saved-recipes-button').style.display = 'none';
});

//============================================================================================================================================================THE SEARCHING
// Add event listener to search button
document.getElementById('search-button').addEventListener('click', () => {
  const searchQuery = document.getElementById('search-input').value.trim();
  searchRecipes(searchQuery); // Always call searchRecipes, even if the query is empty
});
  
// Function to search recipes
function searchRecipes(query) {
    let apiUrl = 'http://localhost:3000/recipes'; // Default URL to fetch all recipes
  
    if (query) {
      // If there's a search query, use the search endpoint
      apiUrl = `http://localhost:3000/search-recipes?query=${query}`;
    }
  
    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        console.log('Search results:', data);
        const recipesDiv = document.getElementById('recipes');
        recipesDiv.innerHTML = ''; // Clear previous content
  
        // Check if data.meals exists and has items
        if (data.meals && data.meals.length > 0) {
          // Fetch saved recipes to check which ones are already saved
          fetch('http://localhost:3000/saved-recipes')
            .then((response) => response.json())
            .then((savedRecipes) => {
              const savedRecipeIds = savedRecipes.map((recipe) => recipe.id); // Get IDs of saved recipes
  
              data.meals.forEach((meal) => {
                const ingredients = [
                  meal.strIngredient1,
                  meal.strIngredient2,
                  meal.strIngredient3,
                  meal.strIngredient4,
                  meal.strIngredient5,
                  meal.strIngredient6,
                  meal.strIngredient7,
                  meal.strIngredient8,
                  meal.strIngredient9,
                  meal.strIngredient10,
                  meal.strIngredient11,
                  meal.strIngredient12,
                  meal.strIngredient13,
                  meal.strIngredient14,
                  meal.strIngredient15,
                  meal.strIngredient16,
                  meal.strIngredient17,
                  meal.strIngredient18,
                  meal.strIngredient19,
                  meal.strIngredient20,
                ].filter((ingredient) => ingredient).join(', ');
  
                const instructions = meal.strInstructions;
  
                const recipeElement = document.createElement('div');
                recipeElement.className = 'recipe-card w-full md:w-1/2 lg:w-1/4 xl:w-1/4 p-4';
                recipeElement.id = `recipe-${meal.idMeal}`;
                recipeElement.innerHTML = `
                  <h2>${meal.strMeal}</h2>
                  <img src="${meal.strMealThumb}" alt="${meal.strMeal}" style="width: 100px; height: 100px;">
                  <p>Ingredients: ${ingredients}</p>
                  <button class="save-button" data-id="${meal.idMeal}" data-name="${meal.strMeal}" data-image="${meal.strMealThumb}" data-ingredients="${ingredients}" data-instructions="${instructions}" ${savedRecipeIds.includes(meal.idMeal) ? 'style="display: none;"' : ''}>Save Recipe</button>
                  <button class="unsave-button" data-id="${meal.idMeal}" ${savedRecipeIds.includes(meal.idMeal) ? '' : 'style="display: none;"'}>Unsave Recipe</button>
                  <button class="view-instructions-button" data-id="${meal.idMeal}" data-instructions="${instructions}">View Instructions</button>
                `;
                recipesDiv.appendChild(recipeElement);
              });
            })
            .catch((error) => console.error('Error fetching saved recipes:', error));
        } else {
          // If no meals are found, fetch and display all recipes
          fetch('http://localhost:3000/recipes')
            .then((response) => response.json())
            .then((allRecipes) => {
              console.log('Displaying all recipes:', allRecipes);
              allRecipes.forEach((meal) => {
                const ingredients = meal.ingredients;
                const instructions = meal.instructions;
  
                const recipeElement = document.createElement('div');
                recipeElement.className = 'recipe-card w-full md:w-1/2 lg:w-1/4 xl:w-1/4 p-4';
                recipeElement.id = `recipe-${meal.id}`;
                recipeElement.innerHTML = `
                  <h2>${meal.name}</h2>
                  <img src="${meal.image}" alt="${meal.name}" style="width: 100px; height: 100px;">
                  <p>Ingredients: ${ingredients}</p>
                  <button class="save-button" data-id="${meal.id}" data-name="${meal.name}" data-image="${meal.image}" data-ingredients="${ingredients}" data-instructions="${instructions}">Save Recipe</button>
                  <button class="unsave-button" data-id="${meal.id}" style="display: none;">Unsave Recipe</button>
                  <button class="view-instructions-button" data-id="${meal.id}" data-instructions="${instructions}">View Instructions</button>
                `;
                recipesDiv.appendChild(recipeElement);
              });
            })
            .catch((error) => console.error('Error fetching all recipes:', error));
        }
      })
      .catch((error) => {
        console.error('Error searching recipes:', error);
        alert('Error searching recipes: ' + error.message);
      });
  }