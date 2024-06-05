const PokemonAPI_URL = "https://pokeapi.co/api/v2/";
let offset = 0;
const limit = 42;
let pokedexIsLoading = false;
let statsData; // Globale Variable für die Stats-Daten
let descriptionData = ""; // Globale Variable für die Beschreibung

// Für den background bei geöffnetem Pokemon
const typeColors = {
  normal: "#c4c3a3",
  fire: "#f38c58",
  water: "#87a4ff",
  electric: "#fce25b",
  grass: "#9ed07e",
  ice: "#b5e1ec",
  fighting: "#e24c45",
  poison: "#c05ab5",
  ground: "#f0d479",
  flying: "#b8a5f9",
  psychic: "#ff83b1",
  bug: "#b6c325",
  rock: "#c4b748",
  ghost: "#8f85b8",
  dragon: "#9577ff",
  dark: "#8c7b67",
  steel: "#bfc0d5",
  fairy: "#e49fcb",
};

async function renderPokedex(offset, limit, path = "pokemon/") {
  let mainContainer = document.getElementById("mainContainer");

  for (let i = offset + 1; i <= offset + limit && i < 1026; i++) {
    let pokemon = await fetch(PokemonAPI_URL + path + i);
    let pokemonJson = await pokemon.json();

    mainContainer.innerHTML += pokemonHtml(pokemonJson);
  }

  pokedexIsLoading = false; // Set loading state to false after fetching
}

function pokemonHtml(pokemonJson) {
  const type1 = pokemonJson["types"][0].type.name;
  const type2 = pokemonJson["types"][1] ? pokemonJson["types"][1].type.name : null;

  return `
    <div id="pokemon${pokemonJson.id}" class="pokemonCardBox type-${type1}-bright" onclick="openPokemonModal(${pokemonJson.id})">
      <div class="pokemonImgBox">
        <img class="pokemonImg" src="${pokemonJson["sprites"]["other"]["official-artwork"]["front_default"]}">
      </div>
      <div class="pokemonCardBottom">
      <div class="pokemonPreInfo">
        <div class="pokemonCardId">
          <b>#${pokemonJson.id}</b>
        </div>
        <div class="pokemonTypes">
          <div class="pokemonTypeInfo type-${type1}">
            ${type1}
          </div>
          ${
            type2
              ? `
          <div class="pokemonTypeInfo type-${type2}">
            ${type2}
          </div>`
              : ""
          }
        </div>
      </div>
      <h2>
        ${capitalizeFirstLetter(pokemonJson["forms"][0]["name"])}
      </h2>
      </div>
    </div>`;
}

// Scroll event listener to load more Pokémon when reaching the bottom
window.addEventListener("scroll", () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200 && !pokedexIsLoading) {
    pokedexIsLoading = true;
    offset += limit;
    renderPokedex(offset, limit);
  }
});

async function searchPokemon() {
  let search = document.getElementById("searchInput").value;
  let renderedPokemon = 0;

  startLoadingAnimation();
  search = search.toLowerCase();
  let mainContainer = document.getElementById("mainContainer");
  mainContainer.innerHTML = "";

  for (let i = 1; i < 1026; i++) {
    let pokemon = await fetch(PokemonAPI_URL + "pokemon/" + [i]);
    let pokemonJson = await pokemon.json();
    let name = pokemonJson["forms"][0]["name"];
    if (name.includes(search)) {
      // renderedPokemon um maximal 10 zu rendern
      renderedPokemon++;
      mainContainer.innerHTML += pokemonHtml(pokemonJson);
    }
    if (renderedPokemon == 10) {
      break;
    }
  }
  stopLoadingAnimation();
  if (mainContainer.innerHTML == "") {
    mainContainer.innerHTML = noPokemonFound(search); // Wenn kein passendes Pokemon gefunden wurde
  }
}

function noPokemonFound(search) {
  return `<span style="color: white; font-size: 1.5rem; margin-top: 58px; font-weight: bold; display: block; -webkit-text-stroke: 1px black;">Sorry, but no Pokémon with the letters "${search}" was found.</span>`;
}

function enableSearchButton() {
  let button = document.getElementById("searchButton");
  let search = document.getElementById("searchInput").value;
  if (search.length < 3) {
    button.disabled = true;
  }
  if (search.length > 2) {
    button.disabled = false;
  }
}

async function renderOpenedPokemon(pokemonId) {
  const modalContent = document.getElementById("modalContent");

  // Fetch the Pokémon data
  const pokemonResponse = await fetch(PokemonAPI_URL + "pokemon/" + pokemonId);
  const pokemonJson = await pokemonResponse.json();

  // Fetch the Pokémon species data for the description
  const speciesResponse = await fetch(PokemonAPI_URL + "pokemon-species/" + pokemonId);
  const speciesJson = await speciesResponse.json();

  // Extract description from species data
  const description = extractDescription(speciesJson);

  // Render the Pokémon details
  modalContent.innerHTML = openedPokemonHtml(pokemonJson);
  const type1 = pokemonJson.types[0].type.name;
  const backgroundColor = typeColors[type1];
  modalContent.style.backgroundColor = backgroundColor;
  renderOpenedPokemonImg(pokemonJson);
  renderOpenedPokemonInfoDiv();
  statsData = pokemonJson.stats; // Setze die Stats-Daten für die globale Variable
  renderStatsChart(statsData); // Hier rufen wir renderStatsChart mit den Stats-Daten des Pokémons auf

  descriptionData = description; // Aktualisiere die globale Beschreibungsvariable
}

function extractDescription(speciesJson) {
  return speciesJson.flavor_text_entries.find((entry) => entry.language.name === "en")
    ? speciesJson.flavor_text_entries.find((entry) => entry.language.name === "en").flavor_text.replace(/[\n\f]/g, " ")
    : "No description available.";
}

function openedPokemonHtml(pokemonJson) {
  const type1 = pokemonJson["types"][0].type.name;
  const type2 = pokemonJson["types"][1] ? pokemonJson["types"][1].type.name : null;

  return `
  <div class="openedPokemonDiv">
      <h2>
        ${capitalizeFirstLetter(pokemonJson["forms"][0]["name"])}
      </h2>
      <div class="pokemonTypes">
          <div class="pokemonTypeInfo type-${type1}">
            ${type1}
          </div>
          ${
            type2
              ? `
          <div class="pokemonTypeInfo type-${type2}">
            ${type2}
          </div>`
              : ""
          }
        </div>
      <div id="openedPokemonImgDiv">
      </div>
  </div>
  <div id="openedPokemonInfoDiv">
  </div>`;
}

function renderOpenedPokemonImg(pokemonJson) {
  let ImgDiv = document.getElementById("openedPokemonImgDiv");
  const arrowLeftImage = "./img/arrow_left.png";
  const arrowRightImage = "./img/arrow_right.png";

  // Überprüfen Sie die Bildschirmbreite und wählen Sie das entsprechende Bild aus
  const arrowImage = window.innerWidth <= 430 ? "./img/arrow_dark_left.png" : arrowLeftImage;
  const nextArrowImage = window.innerWidth <= 430 ? "./img/arrow_dark_right.png" : arrowRightImage;

  ImgDiv.innerHTML = `
    <img class="openedPokemonImg" src="${pokemonJson["sprites"]["other"]["official-artwork"]["front_default"]}">
    <img id="lastImage" onclick="lastImage(${pokemonJson.id})" src="${arrowImage}" alt="">
    <img id="nextImage" onclick="nextImage(${pokemonJson.id})" src="${nextArrowImage}" alt="">
  `;
}

function renderOpenedPokemonInfoDiv() {
  let infoDiv = document.getElementById("openedPokemonInfoDiv");
  infoDiv.innerHTML = `
    <div class="infoHeadlines">
      <span id="stats" onclick="showInfo('stats')" class="active">Stats</span>
      <span id="description" onclick="showInfo('description')">Description</span>
    </div>
    <div id="infoContent">
    </div>
  `;
}

function showInfo(section) {
  // Markiere den ausgewählten Abschnitt
  let allSections = document.querySelectorAll("#openedPokemonInfoDiv span");
  allSections.forEach((span) => {
    span.classList.remove("active");
  });
  document.getElementById(section).classList.add("active");

  // Rendere die entsprechenden Informationen
  let infoContent = document.getElementById("infoContent");
  infoContent.innerHTML = ""; // Leere den Inhalt, um Platz für die neuen Informationen zu machen

  // Rendere die Informationen basierend auf dem ausgewählten Abschnitt
  if (section === "stats") {
    // Rendere Statistiken
    renderStatsChart(statsData); // Hier rufen wir die Funktion auf, um die Stats erneut zu rendern
  } else if (section === "description") {
    // Rendere Informationen zum Pokémon
    renderDescription();
  }
}

function createCanvasElement() {
  const container = document.getElementById("infoContent");
  const canvas = document.createElement("canvas");
  canvas.id = "statsChart";
  if (canvas && container && typeof container.appendChild === "function") {
    container.appendChild(canvas);
    return canvas.getContext("2d");
  }
  return null;
}

function renderChart(ctx, statsData) {
  if (!ctx) {
    return;
  }
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["HP", "Attack", "Defense", "Sp. Attack", "Sp. Defense", "Speed"],
      datasets: [
        {
          label: "Stats",
          data: statsData.map((stat) => stat.base_stat),
          backgroundColor: [
            "rgba(255, 69, 58, 0.6)", // HP - Red
            "rgba(255, 193, 7, 0.6)", // Attack - Yellow
            "rgba(0, 204, 83, 0.6)", // Defense - Green
            "rgba(66, 133, 244, 0.6)", // Special Attack - Blue
            "rgba(255, 152, 0, 0.6)", // Special Defense - Orange
            "rgba(153, 102, 204, 0.6)", // Speed - Purple
          ],
          borderColor: [
            "rgba(255, 69, 58, 1)",
            "rgba(255, 193, 7, 1)",
            "rgba(0, 204, 83, 1)",
            "rgba(66, 133, 244, 1)",
            "rgba(255, 152, 0, 1)",
            "rgba(153, 102, 204, 1)",
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

function renderStatsChart(statsData) {
  const ctx = createCanvasElement();
  renderChart(ctx, statsData);
}

function renderDescription() {
  let container = document.getElementById("infoContent");
  container.innerHTML = descriptionData; // Rendere die globale Beschreibung
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function startLoadingAnimation() {
  let loading = document.getElementById("loadingAnimationDiv");
  loading.innerHTML = `<div class="pokeballLoading">
  </div>`;
}

function stopLoadingAnimation() {
  let loading = document.getElementById("loadingAnimationDiv");
  loading.innerHTML = "";
}

function openPokemonModal(pokemonId) {
  document.getElementById("pokemonModal").classList.remove("dnone");
  renderOpenedPokemon(pokemonId);
}

function closePokemonModal() {
  document.getElementById("pokemonModal").classList.add("dnone");
}

function lastImage(pokemonId) {
  pokemonId--;
  openPokemonModal(pokemonId);
}

function nextImage(pokemonId) {
  pokemonId++;
  openPokemonModal(pokemonId);
}

window.addEventListener("scroll", () => {
  const scrollButton = document.getElementById("scrollUpButton");
  if (window.scrollY > 600) {
    scrollButton.style.display = "block"; // Button anzeigen
  } else {
    scrollButton.style.display = "none"; // Button ausblenden
  }
});

function scrollUp() {
  window.scrollTo({
    top: 0, // Nach oben scrollen
    behavior: "smooth",
  });
}

function redirectToHomePage() {
  window.location.href = window.location.origin; // Leitet den Benutzer zur Startseite weiter
}
