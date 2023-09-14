const mealsEl = document.getElementById('meals')
const favContainer = document.getElementById('fav-meals')
const leftBtn = document.querySelector('.left-btn');
const rightBtn = document.querySelector('.right-btn');

const searchTerm = document.getElementById('search-term')
const searchBtn = document.getElementById('search')
const mealPopup = document.getElementById('meal-popup')
const popupCloseBtn = document.getElementById('close-popup')

const mealInfoEl = document.getElementById('meal-info')

const getRandomMeal = async () => {
    try {
        const res = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
        const randomMeal = await res.json();
        loadRandomMeal(randomMeal.meals[0], true)
    } catch (error) {
        console.error('Error fetching random meal:', error);
    }
};


const getMealById = async (id) => {
    try {
        const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
        const data = await res.json();
        const meal = data.meals[0];
        return meal;
    } catch (error) {
        console.error(`Error fetching meal with ID ${id}:`, error);
    }
};

const getMealBySearch = async (term) => {
    try {
        const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${term}`);
        const data = await res.json();
        const meals = await data.meals;
        return meals
    } catch (error) {
        console.error(`Error fetching meals with search term "${term}":`, error);
    }
};

const loadRandomMeal = (mealData, random = false) => {
    const meal = document.createElement('div')
    meal.classList.add('meal')

    meal.innerHTML = `<div class="meal">
                <div class="meal-header">
                    ${random ? `<span class="random">
                        Random Recipe
                    </span>` : ''}
                    <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
                </div>
                <div class="meal-body">
                    <h4>${mealData.strMeal}</h4>
                    <button class="fav-btn"><i class="fas fa-heart"></i></button>
                </div>
            </div>`

            const btn = meal.querySelector('.meal-body .fav-btn')
            
            btn.addEventListener('click', () => {
                event.stopPropagation();
                if(btn.classList.contains('active')) {
                    removeMealfromLocalStorge(mealData.idMeal)
                    btn.classList.remove('active')
                } else {
                    addMealToLocalStorage(mealData.idMeal)
                    btn.classList.add('active')
                }

                fetchFavMeals();
            })

            meal.addEventListener('click', () => {
                if(btn.contains(event.target)) {
                    return
                } else {
                showMealInfo(mealData)
                }
            })

            mealsEl.appendChild(meal)
}

const addMealToLocalStorage = (mealId) => {
    const mealIds = getMealLocalStorage()

    localStorage.setItem('mealIds', JSON.stringify([...mealIds, mealId]))
}

const removeMealfromLocalStorge = (mealId) => {
    const mealIds = getMealLocalStorage()

    localStorage.setItem('mealIds', JSON.stringify(mealIds.filter(id => id !== mealId)))
}

const getMealLocalStorage = () => {
    const mealIds = JSON.parse(localStorage.getItem('mealIds'))

    return mealIds === null ? [] : mealIds;
}

const fetchFavMeals = async () => {

    //clean the container
    favContainer.innerHTML = '';

    const mealIds = getMealLocalStorage()

    for(let i = 0; i < mealIds.length; i++) {
        const mealId = mealIds[i];

        const meal = await getMealById(mealId)

        addMealToFav(meal)
    }
}

const addMealToFav = (mealData) => {
    const favMeal = document.createElement('li')

    const maxChars = 15;

    const mealName = mealData.strMeal.length > maxChars
        ? mealData.strMeal.slice(0, maxChars) + '...' 
        : mealData.strMeal;

    favMeal.innerHTML = `<li class="favMealsList">
                        <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">${mealName}
                        </li>
                        <button class="clear"><i class="close fas fa-window-close"></i></button>`

                        const btn = favMeal.querySelector('.clear')

                        btn.addEventListener('click', () => {
                            event.stopPropagation();
                            removeMealfromLocalStorge(mealData.idMeal)
                            fetchFavMeals();

                        })

            favMeal.addEventListener('click', () => {
                if(btn.contains(event.target)) {
                    return
                } else {
                    showMealInfo(mealData)
                }
            })

            favContainer.appendChild(favMeal)
}

const showMealInfo = (mealData) => {
    // clear the meal info
    mealInfoEl.innerHTML = '';

    //update the meal info
    const mealEl = document.createElement('div');

    const ingredients = []

    for(let i=1; i<20; i++) {
        if(mealData['strIngredient' + i]) {
            ingredients.push(`${mealData['strIngredient' + i]} = ${mealData['strMeasure' + i]}`)
        } else {
            break;
        } 
    }

    mealEl.innerHTML = `
    <h1>${mealData.strMeal}</h1>
    <img src="${mealData.strMealThumb}" />
    <p>${mealData.strInstructions}</p>
    <h3>Ingredients:</h3>
    <ul>
        ${ingredients.map(ing => `<li>${ing}</li>`).join('')}
    </ul>
`;

    mealInfoEl.appendChild(mealEl)

    //show the popup
    mealPopup.classList.remove('hidden')
}

searchBtn.addEventListener('click', async () => {
    //clean the container 
    mealsEl.innerHTML = '';

    if(searchTerm.value !== '') {
        const search = searchTerm.value
        const meals = await getMealBySearch(search)

        meals && meals.forEach(meal => {
            loadRandomMeal(meal)
        });

    } else {
        alert('Please enter name of any dish or ingredients')
    }
})

popupCloseBtn.addEventListener('click', () => {
    mealPopup.classList.add('hidden')
})

getRandomMeal();
fetchFavMeals();
