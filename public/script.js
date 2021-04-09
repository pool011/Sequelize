// import {mdiStar, mdiStarOutline, mdiStarPlusOutline} from '@mdi/js';
function getFavorites() {
  const favorites = localStorage.getItem('diningFavorites') === null ? ['empty'] : localStorage.getItem('diningFavorites');
  return JSON.parse(`{"diningFavorites": ${favorites}}`);
}

async function getDiningHallData() {
  const endpoint = '/api/dining';
  const request = await fetch(endpoint);
  const allDiningHalls = await request.json();
  console.table(allDiningHalls);
  return allDiningHalls;
}

// function removeFavorite(items) {
//   const favorites = getFavorites();
//   const {diningFavorites} = favorites;
//   console.log('items.id', typeof parseInt(items.id,10), 'diningFavorites', typeof diningFavorites[1]);
//   return parseInt(items.id,10) !== diningFavorites;
// }

async function populateDiningHalls(halls) {
  function setFavorites(favorites) {
    let result;
    if (favorites === null) {
      result = ['empty'];
    } else {
      result = favorites;
    } 
    console.log(typeof result);
    localStorage.setItem('diningFavorites', JSON.stringify(result));
  }

  function showFavorite(id, isFavorite) {
    const favoriteButtonDatum = document.createElement('td');
    const favoriteButton = document.createElement('a');
    favoriteButton.classList.add('button');
    favoriteButton.classList.add('favorite');
    favoriteButton.classList.add('is-inverted');
    const icon = document.createElement('span');
    icon.classList.add('icon');
    const iconImg = document.createElement('i');
    iconImg.classList.add('fa-star');

    if (isFavorite) {
      // favoriteIconRow.innerHTML = '<button class="button favorite" type="button"><span class="icon"><i class="fas fa-star" aria-hidden="false"></i></span></button>';
      iconImg.classList.add('fas');
    } else {
      // favoriteIconRow.innerHTML = '<button class="button favorite" type="button"><span class="icon"><i class="far fa-star" aria-hidden="false"></i></span></button>';
      iconImg.classList.add('far');
    }
 
    iconImg.id = id;

    icon.appendChild(iconImg);
    favoriteButton.appendChild(icon);
    favoriteButtonDatum.appendChild(favoriteButton);
    // const favoriteIcon = favoriteIconElement.querySelector('i');
    // favoriteIcon.id = id;
    // console.log('showFavorite:', favoriteIcon.id, favoriteIcon.classList.contains('fas'));
    return favoriteButtonDatum;
  }

  console.log(halls);
  const favorites = getFavorites();
  const {diningFavorites} = favorites;
  console.log('favorites', favorites);
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
    newRow.innerHTML = `${showFavorite(id, isFavorite).outerHTML}<th>${hall.hall_id}</th><td>${hall.hall_name}</td><td>${hall.hall_address}</td>`;
    tableBody.append(newRow);
  });

  const buttons = document.querySelectorAll('.favorite');
  buttons.forEach((button) => {
    button.addEventListener('click', async (event) => {
      const allDiningHalls = await getDiningHallData();
      console.log('Button event fired.');
      const icon = event.target.querySelector('.fa-star') === null ? event.target : event.target.querySelector('.fa-star');
      // icon.classList.toggle('fas');
      // icon.classList.toggle('far');
      // console.log('items.id', typeof parseInt(icon.id, 10), 'diningFavorites', typeof diningFavorites[1]);
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

async function windowActions() {
  // Create table of dining halls, set favorites.
  const allDiningHalls = await getDiningHallData();
  const favorites = getFavorites();

  const {diningFavorites} = favorites;
  const favoritesArr = (diningFavorites === null) ? ['empty'] : diningFavorites;

  await populateDiningHalls(allDiningHalls, favoritesArr);
}
window.onload = windowActions;