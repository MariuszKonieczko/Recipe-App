window.onload = function () {
  getRandomMeal();
  fetchFavMeals();

  const searchBtn = document.getElementById('search');
  const mealsEl = document.getElementById('meals');

  searchBtn.addEventListener('click', async () => {
    let search = document.getElementById('search-term');
    const term = search.value;
    if (term == '') {
      search.setAttribute('placeholder', 'enter the ingredient');
    } else {
      search.removeAttribute('placeholder');
      mealsEl.innerHTML = '';
      const meals = await getMealBySearch(term);
      if (meals) {
        meals.forEach((meal) => {
          addMeal(meal);
        });
      }
      search.value = '';
    }
  });

  const mealPopup = document.getElementById('meal-popup');
  const popupCloseBtn = document.getElementById('close-popup');
  popupCloseBtn.addEventListener('click', () => {
    mealPopup.classList.add('hidden');
  });
};

async function getRandomMeal() {
  const response = await fetch(
    'https://www.themealdb.com/api/json/v1/1/random.php'
  );
  const responseData = await response.json();
  const randomMeal = responseData.meals[0];
  console.log(randomMeal);
  addMeal(randomMeal, true);
}

function addMeal(mealData, random = false) {
  const meals = document.getElementById('meals');
  const meal = document.createElement('div');
  meal.classList.add('meal');
  meal.innerHTML = `
    <div class="meal-header">
    ${
      random
        ? `
      <span class="random">
        Random Recipe
      </span>`
        : ''
    }
    <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
    </div>
    <div class="meal-body">
      <h4>${mealData.strMeal}</h4>
      <button class="fav-btn"><i class="fas fa-heart"></i></button>
    </div>
  `;

  meal.querySelector('.meal-body .fav-btn').addEventListener('click', (e) => {
    const buttonHeart = e.target.parentNode.classList;
    if (buttonHeart.contains('active')) {
      removeMealFromLS(mealData.idMeal);
      buttonHeart.remove('active');
    } else {
      addMealToLS(mealData.idMeal);
      buttonHeart.toggle('active');
    }

    fetchFavMeals();
  });

  meal.firstElementChild.addEventListener('click', () => {
    showMealInfo(mealData);
  });
  meals.append(meal);
}

function addMealToLS(mealId) {
  const mealIds = getMealFromLS();

  localStorage.setItem('mealIds', JSON.stringify([...mealIds, mealId]));
}

function getMealFromLS() {
  const mealIds = JSON.parse(localStorage.getItem('mealIds'));

  return mealIds === null ? [] : mealIds;
}

function removeMealFromLS(mealId) {
  const mealIds = getMealFromLS();
  localStorage.setItem(
    'mealIds',
    JSON.stringify(mealIds.filter((id) => id !== mealId))
  );
}

async function fetchFavMeals() {
  const favMeal = document.getElementById('fav-meals');
  favMeal.innerHTML = '';
  const mealIds = getMealFromLS();
  const meals = [];
  for (let i = 0; i < mealIds.length; i++) {
    const mealId = mealIds[i];
    meal = await getmealById(mealId);
    addMealToFav(meal);
  }
}

async function getmealById(id) {
  const response = await fetch(
    'https://www.themealdb.com/api/json/v1/1/lookup.php?i=' + id
  );
  const responseData = await response.json();
  const meal = responseData.meals[0];

  return meal;
}

function addMealToFav(mealData) {
  const favMeal = document.getElementById('fav-meals');
  const meal = document.createElement('li');

  meal.innerHTML = `<img src="${mealData.strMealThumb}"
    alt="${mealData.strMeal}"><span>${mealData.strMeal}</span>
    <button class="clear"><i class='fas fa-window-close'></i></button>
  `;

  const btn = meal.querySelector('.clear');
  btn.addEventListener('click', () => {
    removeMealFromLS(mealData.idMeal);
    fetchFavMeals();
  });

  meal.firstElementChild.addEventListener('click', () => {
    showMealInfo(mealData);
  });

  favMeal.append(meal);
}

async function getMealBySearch(term) {
  const response = await fetch(
    'https://www.themealdb.com/api/json/v1/1/search.php?s=' + term
  );
  const responseData = await response.json();
  const meals = responseData.meals;
  return meals;
}

function showMealInfo(mealData) {
  const mealInfoEl = document.getElementById('meal-info');
  const mealPopup = document.getElementById('meal-popup');

  mealInfoEl.innerHTML = '';

  const mealEl = document.createElement('div');

  const ingredients = [];

  for (let i = 0; i < 20; i++) {
    if (mealData['strIngredient' + i]) {
      ingredients.push(
        `${mealData['strIngredient' + i]} - ${mealData['strMeasure' + i]}`
      );
    }
  }

  mealEl.innerHTML = `
    <h1>${mealData.strMeal}</h1>
    <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
    <p>${mealData.strInstructions}</p>
    <h3>Ingredients:<h3>
    <ul class="ingredients">
    ${ingredients.map((ing) => `<li>${ing}</li>`).join('')}</ul>
    `;

  mealInfoEl.append(mealEl);

  mealPopup.classList.remove('hidden');
}
