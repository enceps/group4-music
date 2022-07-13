var tmApiKey = `7elxdku9GGG5k8j0Xm8KWdANDgecHMV0`;
//spotify  client ID
var clientId = '75f1b5b5be744a36bdea07d4bd677517';
var clientSecret = '61d4ffbf8c3a4dc3b0aa0717a104e292';

//Search Form variables
var artistFormEl = document.querySelector("#artist-form");
var nameInputEl = document.querySelector("#artist");
var searchContainerEl = document.querySelector("#search-container");
var artistSearchTerm = document.querySelector("#artist-search-term");

//display variable
var datesContainerEl = document.querySelector("#dates-container");
var youTubeContainerEl = document.querySelector("#youTube-container");

//get value from input element
var formSubmit = function (event) {
  event.preventDefault();
  // console.log(event);
  var artist = nameInputEl.value.trim();

  if (artist) {
    //Add artist(search term) to localStorage
    localStorage.setItem("Search history", artist);

    //get Results
    getDates(artist);

    //Show hidden results (subtitle, youtube link, back-btn)
    $('.subtitle, .youTube-link, .back-btn').css({
      'display': 'block'
    });

    // clear old content
    searchContainerEl.textContent = "";
    nameInputEl.value = "";
  }
};

var getDates = function (artist) {
  // format URL to search by attraction/band 
  var apiUrl = `https://app.ticketmaster.com/discovery/v2/events.json?keyword=` + artist + `&apikey=7elxdku9GGG5k8j0Xm8KWdANDgecHMV0`;

  // make a get request to url
  fetch(apiUrl).then(function (response) {
    //  request was successful
    if (response.ok) {
      console.log(response);
      response.json().then(function (data) {
        //pass response data to DOM
        console.log(data);

        //display Dates
        displayDates(data, artist);
      });
    } else {
      console.log('Error: Artist Not Found');
    }
  })
    .catch(function (error) {
      console.log('Unable to connect.');
    });
};

var displayDates = function (dates, searchTerm) {

  artistSearchTerm.textContent = searchTerm;

  var numOfevents = dates.page.totalElements;

  // spotify- retrieve token -> target search endpoint -> parse external artist link
  var getArtist = async () => {
    await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
      },
      body: 'grant_type=client_credentials'
    }).then(function (response) {
      response.json().then(async function (data) {
        console.log(data);
        access_token = data.access_token;
        console.log(access_token);
        var name = await axios.get("https://api.spotify.com/v1/search?q=" + searchTerm + "&type=artist", { headers: { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' } })

        // embed external link into IFrame
        console.log(name);
        var myJSON = JSON.stringify(name);
        var art = JSON.parse(myJSON);
        console.log(art.data.artists.items[0].external_urls.spotify);
        let url = JSON.stringify(art.data.artists.items[0].external_urls.spotify);
        document.getElementById('spotify').innerHTML = url;
        document.getElementById('spotify').src = 'https://open.spotify.com/embed/artist/' + art.data.artists.items[0].id + '?utm_source=generator'

      })
    });
  }

  //create a link element to take users to the youtube link of the search term
  var ytEl = document.createElement("a");
  var newLine = document.createElement("br");
  var ytLink = document.createTextNode(searchTerm);
  ytEl.appendChild(ytLink);
  ytEl.title = "YouTube Link";
  ytEl.href = "https://www.youtube.com/results?search_query=" + searchTerm;
  //set for opening a new tab for the link
  ytEl.target = "_blank";
  ytEl.rel = "noopener noreferrer";
  youTubeContainerEl.appendChild(ytEl);
  youTubeContainerEl.appendChild(newLine);
  getArtist();

  //check if api returned any tour dates
  if (numOfevents === 0) {  //no tours
    datesContainerEl.textContent = 'No tour dates found.';
    datesContainerEl.setAttribute("style", "font-family: 'Indie Flower';" +
      "font-size: 24px;  font-weight: bold; margin-right: 45px;");
  } else {
    // loop through tour dates
    for (var i = 0; i < numOfevents; i++) {
      var tmEvents = dates._embedded.events[i];

      // format date name that is displayed on screen
      var date = tmEvents.name + " - " + tmEvents.dates.start.localDate +
        " - " + tmEvents.dates.start.localTime +
        " - " + tmEvents._embedded.venues[0].name + " - " +
        tmEvents._embedded.venues[0].city.name + " - " +
        tmEvents._embedded.venues[0].country.countryCode;

      //create a link element to take users to a link to buy tickets for chosen date
      var linkEl = document.createElement("a");
      linkEl.classList = "list-item flex-row justify-space-between align-center";

      var newLine = document.createElement("br");

      var ticketLink = document.createTextNode("" + date);
      linkEl.appendChild(ticketLink);
      linkEl.title = "";
      linkEl.href = tmEvents.url;

      //set for opening a new tab for the link
      linkEl.target = "_blank";
      linkEl.rel = "noopener noreferrer";
      datesContainerEl.appendChild(linkEl);
      datesContainerEl.appendChild(newLine);
    }
  }
};

artistFormEl.addEventListener("submit", formSubmit);