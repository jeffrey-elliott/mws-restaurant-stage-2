/*jshint esversion: 6 */

let restaurant;
var map;

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
}

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant);
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL';
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant);
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const pic = document.getElementById('restaurant-img');
  const url320 = DBHelper.imageUrlForRestaurant(restaurant);

  const src320 = document.createElement('source');
  src320.setAttribute('srcset', url320);
  src320.setAttribute('media', '(max-width: 320px)');

  const src475 = document.createElement('source');
  src475.setAttribute('srcset', DBHelper.imageUrlForRestaurant475(restaurant));

  const image = document.createElement('img');
  image.setAttribute('src', url320);
  image.className = 'restaurant-img';
  image.setAttribute('title',`Photo representing ${restaurant.name} restaurant.`);

  pic.appendChild(src320);
  pic.appendChild(src475);
  pic.appendChild(image);



  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.setAttribute('class','day');
    day.innerHTML = `<span class="small-day"><abbr title='${key}'>${key.substring(0,3).toUpperCase()}</abbr></span><span class="big-day">${key}</span>`;
    row.appendChild(day);

    const time = document.createElement('td');
    time.setAttribute('class','time');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h2');
  title.innerHTML = 'Reviews';
  title.setAttribute('class','res-reviews');
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');

  li.appendChild(createReviewHeader320(review));
  li.appendChild(createReviewHeader475(review));

  const comments = document.createElement('p');
  comments.innerHTML = handleNonsense(review.comments);
  comments.setAttribute('class','rev-comments');
  li.appendChild(comments);

  return li;
}

//https://digwp.com/2011/07/clean-up-weird-characters-in-database/
handleNonsense = (value) => {
  let result = value;

  result = result.split('â€œ').join('“');
  result = result.split('â€').join('”');
  result = result.split('â€™').join('’');
  result = result.split('â€˜').join('‘');
  result = result.split('â€”').join('–');
  result = result.split('â€“').join('—');
  result = result.split('â€¢').join('-');
  result = result.split('â€¦').join('…');

  return result;
}

createReviewHeader320 = (review) => {
  const div = document.createElement('div');
  div.setAttribute('class','rev-header-320');

  const name = document.createElement('p');
  name.innerHTML = `${review.name} (${review.date})`;
  name.setAttribute('class', 'rev-name');
  div.appendChild(name);

  const rule = document.createElement('div');
  rule.setAttribute('class','rev-rule');
  div.appendChild(rule);

  const rating = document.createElement('p');
  rating.appendChild(createRating(review.rating));
  rating.setAttribute('class', 'rev-rating');
  div.appendChild(rating);

  return div;
}

createReviewHeader475 = (review) => {
  const div = document.createElement('div');
  div.setAttribute('class','rev-header-475');

  const name = document.createElement('div');
  name.innerHTML = `${review.name} (${review.date})`;
  name.setAttribute('class', 'rev-name');
  div.appendChild(name);

  const rating = document.createElement('div');
  rating.setAttribute('class', 'rev-rating');
  rating.appendChild(createRating(review.rating));

  div.appendChild(rating);

  return div;
}

createRating = (ratingCount) => {
  const rating = document.createElement('span');

  for(let i = 0; i < ratingCount; i++){
    const star = document.createElement('img');
    star.src = '/img/star.svg';
    rating.appendChild(star);
  }

  rating.setAttribute('title', `Rating: ${ratingCount}`);

  return rating;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
