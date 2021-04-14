// import {mdiStar, mdiStarOutline, mdiStarPlusOutline} from '@mdi/js';
function getFavorites() {
  const favorites = localStorage.getItem('diningFavorites') === null ? '[]' : localStorage.getItem('diningFavorites');
  return JSON.parse(favorites);
}

async function getDiningHallData() {
  const endpoint = '/api/dining';
  const request = await fetch(endpoint);
  const allDiningHalls = await request.json();
  // console.table(allDiningHalls);
  return allDiningHalls;
}

async function populateDiningHalls(halls) {
  function setFavorites(favorites) {
    let result;
    if (favorites === null) {
      result = [];
    } else {
      result = favorites;
    }
    console.log(typeof result);
    localStorage.setItem('diningFavorites', JSON.stringify(result));
  }

  function showFavorite(id, isFavorite) {
    const favoriteButtonDatum = document.createElement('td');
    favoriteButtonDatum.classList.add('has-text-centered');

    const favoriteButton = document.createElement('a');
    favoriteButton.classList.add('button');
    favoriteButton.classList.add('favorite');
    favoriteButton.classList.add('is-inverted');
    

    const icon = document.createElement('span');
    icon.classList.add('icon');

    const iconImg = document.createElement('i');
    iconImg.classList.add('fa-star');

    if (isFavorite) {
      iconImg.classList.add('fas');
    } else {
      iconImg.classList.add('far');
    }

    iconImg.id = id;

    icon.appendChild(iconImg);
    favoriteButton.appendChild(icon);
    favoriteButtonDatum.appendChild(favoriteButton);

    return favoriteButtonDatum;
  }

  console.log('halls', halls);
  const diningFavorites = getFavorites();
  console.log('diningFavorites', diningFavorites);
  const tableBody = document.querySelector('#hall-list tbody');
  tableBody.innerHTML = '';
  halls.data.forEach((hall) => {
    newRow = document.createElement('tr');
    const id = hall.hall_id;
    // console.log(id, favorites);
    let isFavorite = false;
    if (diningFavorites.includes(id)) {
      isFavorite = true;
    }
    newRow.innerHTML = `${showFavorite(id, isFavorite).outerHTML}<th class="has-text-centered">${hall.hall_id}</th><td>${hall.hall_name}</td><td>${hall.hall_address}</td>`;
    tableBody.append(newRow);
  });

  const buttons = document.querySelectorAll('.favorite');
  buttons.forEach((button) => {
    button.addEventListener('click', async (event) => {
      const allDiningHalls = await getDiningHallData();
      console.log('Button event fired.');
      const icon = event.target.querySelector('.fa-star') === null ? event.target : event.target.querySelector('.fa-star');
      if (diningFavorites.includes(parseInt(icon.id, 10))) {
        console.log('Remove favorite');
        const newFavorites = diningFavorites.filter((item) => item !== parseInt(icon.id, 10));
        console.log('newFavorites', newFavorites);
        setFavorites(newFavorites);
      } else {
        console.log('Add favorite');
        diningFavorites.push(parseInt(icon.id, 10));
        setFavorites(diningFavorites);
      }

      populateDiningHalls(allDiningHalls);
    });
  });
}

// shuffle an array passed to the function.
function shuffleArr(arr) {
  const temp = arr;
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [temp[i], temp[j]] = [arr[j], arr[i]];
  }
  return temp;
}

// Creates a get request promise with a timout of 1000 seconds.
function makeGetPromise(enpoint, timeout) {
  const newPromise = new Promise((resolve) => {
    setTimeout(() => resolve(
      fetch(enpoint)
        .then((response) => response.json())
    ), timeout);
  });
  return newPromise;
}

async function getStackBarData() {
  // select 10 random meals and their macros. Runs in parallel.
  const [mealPromise, macroPromise] = [
    makeGetPromise('api/meals', 1000),
    makeGetPromise('api/macros', 1000)
  ];

  const allData = await Promise.all([mealPromise, macroPromise]);
  const [allMeals, allMacros] = [allData[0], allData[1]];
  const shuffledMeals = shuffleArr(allMeals);

  const meals = shuffledMeals.slice(0, 10);
  const ids = meals.map((meal) => meal.meal_id);
  const names = meals.map((meal) => meal.meal_name);

  const macros = allMacros.filter((macro) => ids.find((id) => id === macro.meal_id));

  // The unpopulated object for data to be passed to the chart constructor.
  const visData = [
    {
      type: 'stackedBar',
      name: 'calories',
      yValueFormatString: '#,##0 cal',
      showInLegend: true,
      dataPoints: []
    },
    {
      type: 'stackedBar',
      name: 'serving size',
      showInLegend: true,
      yValueFormatString: '#0',
      dataPoints: []
    },
    {
      type: 'stackedBar',
      name: 'cholesterol',
      showInLegend: true,
      yValueFormatString: '#,##0.## mg',
      dataPoints: []
    },
    {
      type: 'stackedBar',
      name: 'sodium',
      showInLegend: true,
      yValueFormatString: '#,##0.## mg',
      dataPoints: []
    },
    {
      type: 'stackedBar',
      name: 'carbs',
      showInLegend: true,
      yValueFormatString: '#,##0.## g',
      dataPoints: []
    },
    {
      type: 'stackedBar',
      name: 'protein',
      showInLegend: true,
      yValueFormatString: '#,##0.## g',
      dataPoints: []
    },
    {
      type: 'stackedBar',
      name: 'fat',
      visible: true,
      showInLegend: true,
      yValueFormatString: '#,##0.## g',
      dataPoints: []
    }
  ];

  // Format and populate the data for chart.data
  macros.forEach((macro) => {
    // console.log(macro);
    const mealIndex = ids.indexOf(macro.meal_id);
    const mealName = names[mealIndex];
    const iter = Object.entries(macro);
    iter.forEach((x) => {
      const visMac = visData.find((stack) => stack.name === x[0].replace('_', ' '));
      if (visMac) {
        let value = x[1];
        // If there is a value in grams that should be in miligrams (indicated by a 0.001 value),
        // multiply convert to miligrams.
        if ((visMac.yValueFormatString.endsWith('mg')) && ((visMac.name === 'sodium' && value <= 1) || value % Math.round(value) !== 0)) {
          value *= 1000;
          // value = value;
        }
        visMac.dataPoints.push({label: mealName, y: value});
      }
    });
  });

  return visData;
}

// Toggles a data series in the stacked bar chart
function toggleDataSeries(e) {
  if (typeof e.dataSeries.visible === 'undefined' || e.dataSeries.visible) {
    e.dataSeries.visible = false;
  } else {
    e.dataSeries.visible = true;
  }

  e.chart.render();
}

// Builds the stacked bar chart of meals v macros.
async function buildChart(chartData) {
  const chart = new CanvasJS.Chart('chartContainer', {
    animationEnabled: true,
    exportEnabled: true,
    theme: 'light1',
    title: {
      text: 'Macro Composition of Random Dining Hall Meals'
    },
    axisX: {
      // valueFromString: 'DDD'
      labelTextAlign: 'right',
      labelMaxWidth: 150
    },
    axisY: {
      // suffix: 'g'
    },
    toolTip: {
      shared: true
    },
    legend: {
      fontSize: 14,
      cursor: 'pointer',
      verticalAlign: 'bottom',
      horizontalAlign: 'center',
      itemclick: toggleDataSeries
    },
    data: chartData
  });

  return chart;
}

async function windowActions() {
  // Create chart for macros.
  const macroData = await getStackBarData();
  console.log(macroData);
  const chart = await buildChart(macroData);
  chart.render();
  // Create table of dining halls, set favorites.
  const allDiningHalls = await getDiningHallData();
  const diningFavorites = getFavorites();
  const favoritesArr = (diningFavorites === null) ? ['empty'] : diningFavorites;

  await populateDiningHalls(allDiningHalls, favoritesArr);
}
window.onload = windowActions;